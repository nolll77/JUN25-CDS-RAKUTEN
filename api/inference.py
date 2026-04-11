"""
Pipeline d'inférence multimodale Rakuten.
Stacking complet en priorité, MLP en roue de secours.
Switch manuel via endpoint /set-model.

Architecture des features (1131 dimensions) :
  CamemBERT(768) | TF-IDF/SVD desc(80) | TF-IDF/SVD name(30) | EfficientNet/SVD(250) | meta(3)
"""

import os
import re
import time
import unicodedata
import spacy
import sys
import numpy as np
import joblib
from pathlib import Path
from PIL import Image

# Configuration libomp avant les imports d'apprentissage
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
# Suppression des avertissements Hugging Face / Transformers
os.environ["HF_HUB_OFFLINE"] = "1" 
import logging
from transformers import logging as transformers_logging
transformers_logging.set_verbosity_error()
logging.getLogger("huggingface_hub").setLevel(logging.ERROR)


# Architecture MLP définie après import torch (voir Phase 2)


# ══════════════════════════════════════════
# 2. Constantes
# ══════════════════════════════════════════
INPUT_DIM = 1131
N_CLASSES = 27

# Dossiers des artefacts (Structure simplifiée et propre)
BASE_DIR = Path(__file__).parent.parent
ARTIFACTS_ROOT = BASE_DIR / "models"
PREPROCESSORS_DIR = ARTIFACTS_ROOT / "preprocessors"
MODELS_DIR = ARTIFACTS_ROOT / "trained_models"
MISSING_SCALERS_DIR = PREPROCESSORS_DIR

# Mode actuel : "stacking" (défaut) ou "mlp"
CURRENT_MODE = "stacking"

RAKUTEN_MAPPING = {
    10: "Livres occasion", 40: "Jeux vidéo", 50: "Accessoires jeux vidéo",
    60: "Consoles", 1140: "Magazines", 1160: "Livres BD & Mangas",
    1180: "Livres jeunesse", 1280: "Jeux de société traditionnels", 1281: "Jouets & Figurines",
    1300: "Jeux plein air", 1301: "Piscines & Accessoires", 1302: "Mobilier jardin",
    1320: "Literie", 1560: "Décoration intérieure", 1920: "Rangement & Organisation",
    1940: "Linge de maison", 2060: "Meubles salle de bain", 2220: "Meubles TV & Hi-Fi",
    2280: "Meubles chambre", 2403: "Luminaires", 2462: "Tapis & Moquettes",
    2522: "Meubles cuisine", 2582: "Meubles entrée", 2583: "Meubles salon",
    2585: "Meubles bureau", 2705: "Animalerie", 2905: "Autres",
}

# ══════════════════════════════════════════
# 3. Chargement des artefacts au démarrage
#    ORDRE CRITIQUE : sklearn/catboost/lgbm AVANT torch (conflit libomp)
# ══════════════════════════════════════════
print("[inference] Phase 1 : Chargement sklearn / LightGBM / CatBoost...")

# -- Initialisation spaCy (preprocessing texte) --
try:
    nlp = spacy.load("fr_core_news_md", disable=["ner", "parser"])
except OSError:
    print("[inference] spaCy model fr_core_news_md non trouvé, téléchargement...")
    import subprocess
    subprocess.run([sys.executable, "-m", "spacy", "download", "fr_core_news_md"])
    nlp = spacy.load("fr_core_news_md", disable=["ner", "parser"])

# Regex de nettoyage (identiques au notebook nb2)
UNITS_REGEX = re.compile(r'\b\d+[\.,]?\d*\s?(cm|mm|m|kg|g|l|ml|watt|volt|ah|hz)\b', re.I)
NUM_REGEX = re.compile(r'\b\d+[\d\.,]*\b')
HTML_REGEX = re.compile(r'&[a-zA-Z0-9#]+;')          # nettoie &eacute; &nbsp; etc.
NON_WORD_REGEX = re.compile(r'[^\w\s]')              # garde seulement lettres et espaces
STOP_WORDS_EXTRA = re.compile(r'\b(english|the|and|for|with|you|your|can|will|this|that|from|are|not|but|they|their|them|his|her|its|our|my|me|him|she|he|it|be|is|was|were|have|has|had|do|does|did|of|in|on|at|to|by|a|an)\b')

# -- Preprocesseurs texte --
tfidf_desc = joblib.load(PREPROCESSORS_DIR / "tfidf_description_vectorizer.joblib")
tfidf_name = joblib.load(PREPROCESSORS_DIR / "tfidf_designation_vectorizer.joblib")
svd_desc = joblib.load(PREPROCESSORS_DIR / "svd_description.joblib")
svd_name = joblib.load(PREPROCESSORS_DIR / "svd_designation.joblib")

# -- Preprocesseurs image --
svd_img = joblib.load(PREPROCESSORS_DIR / "svd_image_embeddings.joblib")
scaler_meta = joblib.load(PREPROCESSORS_DIR / "image_metadata_scaler.joblib")

# -- Scalers intermédiaires (EXTRAITS DU NOTEBOOK) --
scaler_text_svd = joblib.load(MISSING_SCALERS_DIR / "scaler_text_svd.joblib")
scaler_image_svd = joblib.load(MISSING_SCALERS_DIR / "scaler_image_svd.joblib")

# -- Scaler final --
scaler_features = joblib.load(PREPROCESSORS_DIR / "preprocessing_scaler_features.joblib")

# -- Classes cibles --
target_classes = np.load(MODELS_DIR / "target_classes.npy", allow_pickle=True)
print(f"[inference] {len(target_classes)} classes chargées: {target_classes[:5]}...")

# -- Modèles de base du Stacking (PAS de torch ici) --
lgbm_models = []
for fold in range(1, 6):
    path = MODELS_DIR / f"model_lgbm_fold_{fold}.joblib"
    model = joblib.load(path)
    if hasattr(model, "set_params"):
        model.set_params(n_jobs=1) # Force 1 thread pour éviter deadlock sur Mac
    lgbm_models.append(model)
print(f"[inference] LightGBM: {len(lgbm_models)} folds chargés (n_jobs=1)")

# 4. CatBoost
from catboost import CatBoostClassifier
catboost_model = CatBoostClassifier()
catboost_model.load_model(str(MODELS_DIR / "model_catboost.cbm"))
# Pour CatBoost, on limite aussi les threads via les paramètres de prédiction si possible
# ou on le laisse tel quel s'il ne bloque pas au chargement.
print("[inference] CatBoost chargé (.cbm)")

lr_model = joblib.load(MODELS_DIR / "model_logistic_regression.joblib")
print("[inference] Logistic Regression chargée")

meta_learner = joblib.load(MODELS_DIR / "model_stacking_meta_learner.joblib")
print("[inference] Meta Stacking Learner chargé")

# -- Phase 2 : Maintenant on charge torch et les modèles DL --
print("[inference] Phase 2 : Chargement PyTorch / CamemBERT / EfficientNet...")

import torch
import torch.nn as nn
from torchvision import transforms

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"[inference] Device: {DEVICE}")

# -- Architecture MLP (identique à nb3) --
class MLP(nn.Module):
    def __init__(self, d, n_classes):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(d, 1024),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(1024, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, n_classes)
        )
    def forward(self, x):
        return self.net(x)

# -- Modèle MLP --
mlp_model = MLP(INPUT_DIM, N_CLASSES).to(DEVICE)
mlp_model.load_state_dict(torch.load(MODELS_DIR / "model_mlp_state_dict.pt", map_location=DEVICE))
mlp_model.eval()
print("[inference] MLP chargé (roue de secours)")

# -- CamemBERT --
from transformers import AutoTokenizer, AutoModel
camembert_tokenizer = AutoTokenizer.from_pretrained("camembert-base")
camembert_model = AutoModel.from_pretrained("camembert-base").to(DEVICE)
camembert_model.eval()
print("[inference] CamemBERT OK")

# -- EfficientNet --
import timm
efficientnet_model = timm.create_model("efficientnet_b3", pretrained=True, num_classes=0).to(DEVICE)
efficientnet_model.eval()
print("[inference] EfficientNet OK")

# -- Transform image --
img_transform = transforms.Compose([
    transforms.Resize((300, 300)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

print("[inference] ALL ARTIFACTS LOADED SUCCESSFULLY")


# ══════════════════════════════════════════
# 4. Fonctions de preprocessing
# ══════════════════════════════════════════

def clean_text(text: str) -> str:
    """Nettoyage texte robuste - Aligné sur production."""
    if not isinstance(text, str) or not text:
        return ""
    
    # Normalisation NFKD pour les accents
    text = unicodedata.normalize('NFKD', text.lower())
    # Nettoyage regex de base
    text = re.sub(r'<.*?>', ' ', text)
    text = re.sub(r'[^a-z0-9àâäéèêëîïôöùûüç]', ' ', text)
    
    # Nettoyage spaCy (lemmatisation)
    doc = nlp(text)
    tokens = [token.lemma_.strip() for token in doc 
              if not token.is_stop and not token.is_punct and len(token.lemma_) > 2]
    
    return " ".join(tokens).strip()


def extract_camembert_embedding(text: str) -> np.ndarray:
    """Embedding CamemBERT [CLS] (768 dims) sur texte brut."""
    tokens = camembert_tokenizer(
        text, return_tensors="pt", truncation=True, max_length=256, padding=True
    ).to(DEVICE)
    with torch.no_grad():
        output = camembert_model(**tokens)
    return output.last_hidden_state[:, 0, :].cpu().numpy()  # (1, 768)


def extract_tfidf_svd_features(title: str, description: str = "") -> np.ndarray:
    """TF-IDF + SVD avec séparation stricte Designation (30) et Description (80)."""
    title_clean = clean_text(title)
    desc_clean = clean_text(description)
    
    # 1. Designation SVD (30 dims)
    tfidf_name_vec = tfidf_name.transform([title_clean])
    svd_name_vec = svd_name.transform(tfidf_name_vec)
    
    # 2. Description SVD (80 dims)
    tfidf_desc_vec = tfidf_desc.transform([desc_clean])
    svd_desc_vec = svd_desc.transform(tfidf_desc_vec)
    
    # 3. Fusion (ORDRE : Description(80) puis Designation(30) selon nb2 line 2418)
    combined_svd = np.hstack([svd_desc_vec, svd_name_vec])
    
    # 4. Scaler intermédiaire (110 dims)
    scaled_svd = scaler_text_svd.transform(combined_svd)
    return scaled_svd, title_clean, desc_clean


def extract_image_features(image_path: str) -> np.ndarray:
    """EfficientNet/SVD (250) + métadonnées (3) = 253 dims."""
    img = Image.open(image_path).convert("RGB")
    w, h = img.size
    
    # NOTE: Dans NB2 line 2831, les métadonnées sont (title_len, word_count, image_width)
    # Dans NB3, elles sont scalées par le scaler GLOBAL. Donc on les laisse brutes ici.
    
    img_tensor = img_transform(img).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        embedding = efficientnet_model(img_tensor).cpu().numpy()
    
    # SVD + Scaler intermédiaire Image (250 dims) selon NB2 line 42431
    img_svd_raw = svd_img.transform(embedding)
    img_svd_scaled = scaler_image_svd.transform(img_svd_raw)
    
    return img_svd_scaled, w

def build_feature_vector(text: str, image_path: str) -> tuple[np.ndarray, np.ndarray]:
    """Prépare le vecteur de 1131 dims (CamemBERT, Text SVD, Image SVD, Meta)."""
    
    # 1. Texte SVD (110)
    text_svd_vec, title_cl, desc_cl = extract_tfidf_svd_features(text, "")
    
    # 2. CamemBERT (768)
    full_text_clean = (title_cl + " " + desc_cl).strip()
    camembert_vec = extract_camembert_embedding(full_text_clean)
    
    # 3. Image (SVD 250 + Metadata image_width 1)
    if image_path and os.path.exists(image_path):
        img_svd_scaled, img_w = extract_image_features(image_path)
        # Métadonnées brutes (title_len, word_count, image_width)
        meta_features = np.array([[len(text), len(text.split()), img_w]], dtype=np.float32)
        img_vec = np.hstack([img_svd_scaled, meta_features])
    else:
        img_vec = np.zeros((1, 253))
        
    X_raw = np.hstack([camembert_vec, text_svd_vec, img_vec]).astype(np.float32)
    
    # 4. Global scaling
    X_scaled_raw = scaler_features.transform(X_raw).astype(np.float32)
    
    # PROTECTION OPTIMALE: On réduit le clipping à +/- 3.0. 
    # Au-delà de 3 sigmas, la LogReg et le MLP saturent et "étouffent" le signal de LightGBM.
    X_scaled = np.clip(X_scaled_raw, -3.0, 3.0)
    
    print(f"\n[DEBUG] --- STATS PAR BLOC ---")
    print(f"[DEBUG] CamemBERT (768): mean={camembert_vec.mean():.4f}, std={camembert_vec.std():.4f}")
    print(f"[DEBUG] Text SVD (110):  mean={text_svd_vec.mean():.4f}, std={text_svd_vec.std():.4f}")
    print(f"[DEBUG] Image block (253): mean={img_vec.mean():.4f}, std={img_vec.std():.4f}")
    print(f"[DEBUG] X_raw Total: mean={X_raw.mean():.4f}, std={X_raw.std():.4f}")
    print(f"[DEBUG] X_scaled (clipped 3.0): min={X_scaled.min():.4f}, max={X_scaled.max():.4f}")
    
    return X_raw, X_scaled


# ══════════════════════════════════════════
# 5. Inférence Stacking
# ══════════════════════════════════════════

def predict_stacking(X_raw: np.ndarray, X_scaled: np.ndarray) -> np.ndarray:
    """
    Inférence combinée :
    1. Obtenir probas LightGBM (moyenne folds)
    2. Obtenir probas CatBoost
    3. Obtenir probas Logistic Regression
    4. Obtenir probas MLP (Deep Learning)
    5. Concaténer les 4 × 27 = 108 probas
    6. Passer au meta_learner → probas finales (1, 27)
    """
    
    print("\n[DEBUG] --- BASE MODELS PREDICTIONS ---")
    
    # 1. LightGBM
    lgbm_probas = np.zeros((1, N_CLASSES))
    for i, m in enumerate(lgbm_models):
        # NOTE: LightGBM a été entraîné sur X_raw (sans le scaler global)
        p = m.predict_proba(X_raw)
        lgbm_probas += p
        print(f"[DEBUG]   -> LGBM Fold {i+1}: {target_classes[np.argmax(p[0])]} ({p[0].max()*100:.1f}%)")
    lgbm_probas /= len(lgbm_models)
    
    # 2. CatBoost
    cb_probas = catboost_model.predict_proba(X_scaled)
    print(f"[DEBUG]   -> CatBoost: {target_classes[np.argmax(cb_probas[0])]} ({cb_probas[0].max()*100:.1f}%)")
    
    # 3. Logistic Regression
    lr_probas_raw = lr_model.predict_proba(X_scaled)
    # Lissage visuel (Power 0.5)
    lr_p_smooth = np.power(lr_probas_raw, 0.5)
    lr_p_smooth /= lr_p_smooth.sum(axis=1, keepdims=True)
    print(f"[DEBUG]   -> LogReg (Smoothed T=2.0 eq): {target_classes[np.argmax(lr_p_smooth[0])]} ({lr_p_smooth[0].max()*100:.1f}%)")
    
    # 4. MLP (Deep Learning)
    with torch.no_grad():
        tensor_input = torch.from_numpy(X_scaled.copy()).float().to(DEVICE)
        logits = mlp_model(tensor_input)
        mlp_probas_raw = torch.softmax(logits, dim=1).cpu().numpy()
        # Lissage visuel (T=2.0)
        mlp_p_smooth = torch.softmax(logits / 2.0, dim=1).cpu().numpy()
    print(f"[DEBUG]   -> MLP (Smoothed T=2.0): {target_classes[np.argmax(mlp_p_smooth[0])]} ({mlp_p_smooth[0].max()*100:.1f}%)")
    
    # 5. Fusion pour Meta-Learner (RAW requis)
    stacking_input = np.hstack([lgbm_probas, cb_probas, lr_probas_raw, mlp_probas_raw])
    
    # 6. Meta-Learner + Calibration Finale
    print("\n[DEBUG] --- ETAPE 6: META-LEARNER FUSION ---")
    final_probas = meta_learner.predict_proba(stacking_input)
    
    # Anti-biais (Penalty sur 1140 et 2582 si > 85%)
    top_idx = np.argmax(final_probas[0])
    top_code = int(target_classes[top_idx])
    if top_code in (1140, 2582) and final_probas[0][top_idx] > 0.85:
        print(f"[DEBUG]   [Calibration] Dampening bias for {top_code} (Magazines/Entrée)")
        final_probas[0][top_idx] *= 0.8
        final_probas[0] /= final_probas[0].sum()

    print(f"[DEBUG]   -> META-RESULT FINAL: {target_classes[np.argmax(final_probas[0])]} ({final_probas[0].max()*100:.1f}%)")
    return final_probas[0]


def predict_mlp_only(X_scaled: np.ndarray) -> np.ndarray:
    """Inférence MLP seul (roue de secours)."""
    with torch.no_grad():
        tensor_input = torch.tensor(X_scaled).to(DEVICE)
        logits = mlp_model(tensor_input)
        probas = nn.Softmax(dim=1)(logits).cpu().numpy()
    return probas[0]


# ══════════════════════════════════════════
# 6. Switch de mode + fonction publique
# ══════════════════════════════════════════

def set_mode(mode: str):
    """Change le mode d'inférence : 'stacking' ou 'mlp'."""
    global CURRENT_MODE
    if mode in ("stacking", "mlp"):
        CURRENT_MODE = mode
        print(f"[inference] Mode changé → {CURRENT_MODE}")
    else:
        raise ValueError(f"Mode inconnu: {mode}. Valeurs acceptées: 'stacking', 'mlp'")


def get_current_mode() -> str:
    return CURRENT_MODE


def get_top_predictions(text: str, image_path: str = None, top_k: int = 5):
    """
    Pipeline complet : texte + image → prédiction Top-K.
    Utilise le stacking ou le MLP selon le mode actif.
    Si le stacking plante → fallback automatique vers MLP.
    """
    t0 = time.time()
    X_raw, X_scaled = build_feature_vector(text, image_path)
    t_features = time.time() - t0

    mode_used = CURRENT_MODE
    t1 = time.time()

    if CURRENT_MODE == "stacking":
        try:
            probas = predict_stacking(X_raw, X_scaled)
        except Exception as e:
            print(f"[inference] Warning: Stacking failed ({e}), fallback to MLP")
            probas = predict_mlp_only(X_scaled)
            mode_used = "mlp"
    else:
        probas = predict_mlp_only(X_scaled)

    t_predict = time.time() - t1

    # Top-K
    sorted_idx = probas.argsort()[-top_k:][::-1]
    results = []
    for idx in sorted_idx:
        code = int(target_classes[idx])
        conf = float(probas[idx])
        print(f"[DEBUG]   -> Neuron {idx}: Code {code} ({conf*100:.1f}%)")
        results.append({
            "code": code,
            "label": RAKUTEN_MAPPING.get(code, f"Catégorie {code}"),
            "proba": round(conf, 4)
        })

    print(f"[inference] Mode={mode_used} | Features={t_features:.2f}s | Predict={t_predict:.2f}s")
    return results, mode_used
