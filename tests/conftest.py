"""
Fixtures partagées pour tous les tests.
Données de test légères, sans dépendances externes.
"""

import pytest
import numpy as np
import pandas as pd
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))


@pytest.fixture
def textes_exemples():
    """Liste de textes bruts pour les tests de prétraitement."""
    return [
        "Chaussures de sport Nike RUNNING 2024 !!!",
        "Téléphone portable   Samsung Galaxy S21",
        "Livre de cuisine : Recettes françaises",
        "Jeu vidéo PlayStation CALL OF DUTY",
        "Vêtement enfant robe été fleurie",
    ]


@pytest.fixture
def textes_nettoyes():
    """Textes déjà nettoyés, attendus après prétraitement standard."""
    return [
        "chaussures de sport nike running 2024",
        "telephone portable samsung galaxy s21",
        "livre de cuisine recettes francaises",
        "jeu video playstation call of duty",
        "vetement enfant robe ete fleurie",
    ]


@pytest.fixture
def dataframe_numerique():
    """Dataframe avec colonnes numériques pour les tests de normalisation."""
    np.random.seed(42)
    return pd.DataFrame({
        "prix": np.random.uniform(1, 1000, 100),
        "poids": np.random.uniform(0.1, 50, 100),
        "stock": np.random.randint(0, 500, 100).astype(float),
    })


@pytest.fixture
def dataframe_avec_manquants():
    """Dataframe avec valeurs manquantes pour tester GestionnaireValeursManquantes."""
    np.random.seed(42)
    df = pd.DataFrame({
        "prix": [10.0, None, 30.0, None, 50.0],
        "poids": [1.0, 2.0, None, 4.0, 5.0],
        "categorie": ["A", "B", None, "A", "C"],
    })
    return df


@pytest.fixture
def donnees_classification_binaire():
    """Données synthétiques pour une classification binaire."""
    np.random.seed(42)
    n = 200
    X = np.random.randn(n, 10)
    y = (X[:, 0] + X[:, 1] > 0).astype(int)
    return X, y


@pytest.fixture
def donnees_classification_multiclasse():
    """Données synthétiques pour une classification multiclasse (5 classes)."""
    np.random.seed(42)
    from sklearn.datasets import make_classification
    X, y = make_classification(
        n_samples=300,
        n_features=20,
        n_informative=10,
        n_classes=5,
        n_clusters_per_class=1,
        random_state=42
    )
    return X, y


@pytest.fixture
def features_texte_vectorisees(textes_exemples):
    """Features TF-IDF extraites à partir des textes exemples."""
    from src.feature_engineering import ExtracteurFeaturesTexte
    extracteur = ExtracteurFeaturesTexte(methode="tfidf", nb_features=50, min_df=1)
    return extracteur.adapter_transformer(textes_exemples), extracteur
