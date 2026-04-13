---
title: Rakuten Multimodal API
emoji: 🚀
colorFrom: red
colorTo: gray
sdk: docker
pinned: false
---

# Rakuten Multimodal Classification Engine

Ce moteur de classification de produits exploite le Deep Learning Multimodal (Texte + Image) pour résoudre le challenge **<a href="https://challengedata.ens.fr/challenges/35">Rakuten / Challenge Data ENS</a>**. 

> Ce challenge porte sur la classification multimodale à grande échelle des product-type-code, le but étant de prédire la classe de chaque produit telle que défini Rakuten.

**Objectif** : Prédire le type de produit à grande échelle en fusionnant les signaux textuels (désignations, descriptions) et visuels (images).

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

## Installation et Lancement Local

### 1. Prérequis
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m spacy download fr_core_news_md
git lfs pull
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

### 4. Workflow Git LFS (Modèles Volumineux)
Le projet utilise **Git LFS** pour gérer les fichiers modèles (.joblib, .cbm, etc.). 
- **Modifications** : Travaillez normalement, Git LFS gère les binaires en arrière-plan.
- **Premier Clone** : N'oubliez pas de lancer `git lfs pull` pour récupérer les vrais fichiers binaires à la place des pointeurs.

## Performance et Qualité
Le système a été validé sur des cas complexes (mots courts, désignations ambiguës) avec une précision stabilisée après résolution de la dérive de classification.

---

**Équipe** : 
- Noel CHING (Lead Data Scientist, ML Ops & Architecture)
- Ediz OZKOHEN (Data Science Associate, Technical Writing & Communications)  

**Statut** : API Déployée et Stabilisée (Avril 2026)

---

<div align="center">
  <img src="docs/liora_logo.png" alt="Liora Logo" width="120" />
  <p>Un projet développé dans le cadre du cursus <b><a href="https://liora.io/">Liora</a></b></p>
</div>