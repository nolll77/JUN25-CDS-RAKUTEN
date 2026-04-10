# Rakuten Multimodal Classification Engine

Ce projet implémente un moteur de classification de produits exploitant le Deep Learning Multimodal (Texte + Image) pour catégoriser les produits Rakuten.

## Points Forts du Projet

- **Architecture hybride** : Fusion de modèles Transformers (CamemBERT) et de Computer Vision (EfficientNet / CNN).
- **Stacking multicouche** : Système d'ensemble combinant LightGBM, CatBoost, Régression Logistique et MLP via un Meta-Learner.
- **Inférence Optimisée** : Pipeline d'inférence aligné sur les données d'entraînement (tokenisation [CLS], normalisation des métadonnées, clipping de stabilité).
- **Architecture API** : Backend FastAPI haute performance avec monitoring de diagnostic intégré.

## Architecture du Pipeline

L'inférence génère un vecteur de caractéristiques de 1131 dimensions :
1. **Texte (768)** : Embeddings CamemBERT (token [CLS]).
2. **Texte SVD (110)** : Désignation (30) + Description (80) via TF-IDF & SVD.
3. **Image Vision (250)** : Features EfficientNet réduites par SVD.
4. **Metadata (3)** : [Longueur titre, Nombre de mots, Largeur image].

### Stratégie de Stacking
Le modèle utilise un Meta-Learner qui fusionne les prédictions (108 probabilités) de 4 modèles de base :
- **LightGBM** (5-Folds) : Opère sur les données brutes pour capturer les non-linéarités.
- **CatBoost & LogReg** : Opèrent sur les données scalées.
- **MLP (Deep Learning)** : Fournit une vision probabiliste neuronale.

## Installation et Lancement

### 1. Prérequis
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m spacy download fr_core_news_md
```

### 2. Lancement du Backend (FastAPI)
Le backend surveille les changements et affiche des logs de diagnostic détaillés pour chaque prédiction.
```bash
TOKENIZERS_PARALLELISM=false uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Lancement du Frontend
```bash
cd frontend
npm install
npm run dev
```
Accès à l'interface de démo : http://localhost:8080/demo/image

## Performance et Qualité
Le système a été validé sur des cas complexes (mots courts, désignations ambiguës) avec une précision stabilisée après résolution de la dérive de classification.

---
**Équipe** : 
- Noel CHING (Lead Data Scientist, ML Ops & Architecture)
- Ediz OZKOHEN (Data Science Associate, Technical Writing & Communications)  
**Statut** : API Déployée et Stabilisée (Avril 2026)