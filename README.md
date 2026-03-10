# Classification Multimodale — Produits Rakuten

Projet de classification multimodale (texte + images) pour catégoriser 84 916 produits Rakuten en 27 catégories.

## Architecture

Classifieur automatique exploitant trois types de données :
- données textuelles : description et désignation des produits
- données visuelles : images représentatives
- données structurées : métadonnées additionnelles

## Étapes du projet

| Étape | Deadline | Objectif |
|-------|----------|----------|
| 1 - Exploration | 27/10/2025 | EDA + visualisations |
| 2 - Prétraitement | 17/11/2025 | Nettoyage, feature engineering |
| 3 - Modélisation | 19/02/2026 | Baseline, optimisation, deep learning |
| 4 - Rapport final | 20/03/2026 | Consolidation + rapport complet |
| 5 - Streamlit | semaine du 13/04/2026 | Application interactive + soutenance |

## Structure du projet

```
JUN25-CDS-RAKUTEN/
├── README.md
├── requirements.txt
├── LICENSE
├── .gitignore
│
├── data/
│   ├── csv/
│   │   ├── X_train_update.csv
│   │   ├── X_test_update.csv
│   │   └── Y_train_CVw08PX.csv
│   └── images/
│       ├── image_train/
│       └── image_test/
│
├── notebooks/
│   ├── 01_EXPLORATION/
│   │   └── 1.0_exploration_eda.ipynb
│   ├── 02_PREPROCESSING/
│   │   └── 2.0_preprocessing_pipeline.ipynb
│   └── 03_MODELING/
│       └── 3.3_final_models.ipynb
│
├── src/
│   ├── preprocessing.py
│   ├── feature_engineering.py
│   ├── modeling.py
│   ├── visualization.py
│   └── utils.py
│
├── scripts/
│   ├── 01_load_and_explore.py
│   ├── 02_preprocess_batch.py
│   └── 03_train_models.py
│
├── tests/
│   ├── conftest.py
│   ├── test_unitaires_preprocessing.py
│   ├── test_unitaires_feature_eng.py
│   ├── test_unitaires_modelisation.py
│   └── test_integration_pipeline.py
│
├── models/
│   ├── preprocessors/
│   └── trained_models/
│
├── reports/
├── config/
│   └── config.yaml
└── logs/
```

## Installation

Prérequis : Python 3.8+, Git, 4+ Go de RAM (8+ recommandé)

```bash
git clone https://github.com/DataScientest-Studio/JUN25-CDS-RAKUTEN.git
cd JUN25-CDS-RAKUTEN
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m spacy download fr_core_news_sm
```

## Utilisation

### Exploration des données
```bash
jupyter notebook notebooks/01_EXPLORATION/1.0_exploration_eda.ipynb
```

### Prétraitement (pipeline complet)
```bash
jupyter notebook notebooks/02_PREPROCESSING/2.0_preprocessing_pipeline.ipynb
# ou via script
python scripts/02_preprocess_batch.py
```

### Modélisation
```bash
python scripts/03_train_models.py
```

### Tests
```bash
pytest tests/ -v
```

## Modules réutilisables

```python
from src.preprocessing import PreprocesseurTexte, PreprocesseurImage

prep = PreprocesseurTexte()
textes_nettoyes = prep.adapter_transformer(df["description"].values)

from src.feature_engineering import ExtracteurFeaturesTexte

extracteur = ExtracteurFeaturesTexte(methode="tfidf", nb_features=1000)
features = extracteur.adapter_transformer(textes_nettoyes)

from src.modeling import EntraineurModele, EvaluateurModele

entraineur = EntraineurModele()
modele = entraineur.entrainer_foret_aleatoire(X_train, y_train)
```

## Résultats

| Modèle | Accuracy | Precision | Rappel | F1 |
|--------|----------|-----------|--------|----|
| Régression Logistique | - | - | - | - |
| Forêt Aléatoire | - | - | - | - |
| XGBoost | - | - | - | - |
| LightGBM | - | - | - | - |

*à compléter après modélisation complète*

## Équipe

- nolll — MacBook Intel, Lead Data Science
- ediz — PC Ryzen, approches alternatives

## Branches Git

- `main` — code stable et revu
- `develop` — développement actif
- `feature/*` — fonctionnalités spécifiques

## Ressources

- [Template rapport](https://docs.google.com/document/d/...) (DataScientest)
- [Méthodologie soutenance](https://docs.google.com/document/d/...) (DataScientest)

## Licence

MIT — voir `LICENSE`.

Dernière mise à jour : Mars 2026 — Statut : en développement (étapes 1-3)