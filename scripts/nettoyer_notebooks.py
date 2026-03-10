import json
import re
import os
from pathlib import Path

# nolll's Dictionnaire de corrections pour le code (Français cassé -> Nom standard)
CORRECTIONS_CODE = {
    r'\bdispositif=': 'device=',
    r'\bdispositifs=': 'devices=',
    r'\btorch\.dispositif\(': 'torch.device(',
    r'\btaille_fig=': 'figsize=',
    r'\betat_aleatoire=': 'random_state=',
    r'\bnb_composantes=': 'n_components=',
    r'\bplage_ngram=': 'ngram_range=',
    r'\bnb_features=': 'max_features=',
    r'\bnb_estimateurs=': 'n_estimators=',
    r'\bprof_max=': 'max_depth=',
    r'\bprofondeur_max=': 'max_depth=',
    r'\btaux_apprentissage=': 'learning_rate=',
    r'\bmetriques\b': 'metrics',
    r'\bscore_f1\(': 'f1_score(',
    r'\bmatrice_confusion\(': 'confusion_matrix(',
    r'\bmodeles\b': 'models',
    r'\btitre=': 'title=',
}

# Patterns pour casser les lignes jointes (KeywordNext -> Keyword\nNext)
JOINED_PATTERNS = [
    (r'(import\s+\w+)(import\s+)', r'\1\n\2'),
    (r'(import\s+\w+)(from\s+)', r'\1\n\2'),
    (r'(from\s+[\w\.]+\s+import\s+[\w,\s\(\)]+)(import\s+)', r'\1\n\2'),
    (r'(from\s+[\w\.]+\s+import\s+[\w,\s\(\)]+)(from\s+)', r'\1\n\2'),
    (r'(\w+)(import\s+|from\s+|print\(|if\s+|for\s+|while\s+|try:|with\s+|def\s+|class\s+|#)', r'\1\n\2'),
    (r'(:)\s*(print|if|for|while|try|with|def|class)\b', r'\1\n    \2'),
    (r'(\))\s*(print|if|for|while|try|with|def|class|#)', r'\1\n\2'),
    (r'(\w+\(.*?\))\s*(print|if|for|while|try|with|def|class|#)', r'\1\n\2'),
    (r'(torch)\.(set_num_threads\(\d+\))', r'\1.\2\n'),
    (r'(torch)\.(device\(".*?"\))', r'\1.\2\n'),
    (r'(device_cpu)\s+(=)', r'\n\1 \2'),
    (r'(a_cpu)\s+(=)', r'\n\1 \2'),
    (r'(b_cpu)\s+(=)', r'\n\1 \2'),
    (r'(start)\s+(=)', r'\n\1 \2'),
    (r'(c_cpu)\s+(=)', r'\n\1 \2'),
    (r'(gc)\.(collect\(\))', r'\n\1.\2'),
    (r'(sys)\.(path)\.', r'\n\1.\2.'),
]

def supprimer_emojis(texte):
    return re.sub(r'[^\x00-\x7fÀ-ÿ]', '', texte)

def nettoyer_cellule(cellule):
    source = cellule.get("source", [])
    if isinstance(source, list):
        source = "".join(source)
    
    # 1. Supprimer les emojis
    source = supprimer_emojis(source)
    
    # 2. Si c'est du code, appliquer les corrections de noms et casser les lignes
    if cellule["cell_type"] == "code":
        # Corrections de noms
        for pattern, repl in CORRECTIONS_CODE.items():
            source = re.sub(pattern, repl, source)
        
        # Casser les lignes jointes
        for pattern, repl in JOINED_PATTERNS:
            source = re.sub(pattern, repl, source)
    
    # 3. Nettoyer les séparateurs excessifs
    source = re.sub(r'={3,}', '===', source)
    source = re.sub(r'-{3,}', '---', source)
    
    # Re-diviser en liste de lignes (format ipynb standard)
    lignes = [l + "\n" for l in source.split("\n")]
    if lignes and lignes[-1].endswith("\n"):
        lignes[-1] = lignes[-1][:-1]
        
    cellule["source"] = lignes
    return cellule

def traiter_notebook(chemin_entree, chemin_sortie=None):
    if chemin_sortie is None:
        chemin_sortie = chemin_entree
        
    print(f"Traitement de {chemin_entree}...")
    with open(chemin_entree, 'r', encoding='utf-8') as f:
        nb = json.load(f)
    
    nb["cells"] = [nettoyer_cellule(c) for c in nb["cells"]]
    
    # Supprimer les métadonnées de l'agent si présentes
    if "metadata" in nb:
        nb["metadata"].pop("antigravity", None)
        
    with open(chemin_sortie, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)
    print(f"Terminé : {chemin_sortie}")

if __name__ == "__main__":
    notebooks = [
        "notebooks/01_EXPLORATION/1.0_exploration_eda.ipynb",
        "notebooks/02_PREPROCESSING/2.0_preprocessing_pipeline.ipynb",
        "notebooks/03_MODELING/3.3_final_models.ipynb"
    ]
    
    base_path = "/Users/nolll/Documents/rakuten_project_clean"
    for nb_rel in notebooks:
        chemin = os.path.join(base_path, nb_rel)
        if os.path.exists(chemin):
            traiter_notebook(chemin)
        else:
            print(f"Fichier non trouvé : {chemin}")
