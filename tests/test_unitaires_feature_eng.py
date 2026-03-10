"""
Tests unitaires — module feature_engineering.
Vérifie l'extraction de features, la réduction de dimensionnalité et la combinaison.
"""

import pytest
import numpy as np
import pandas as pd
import sys
from pathlib import Path
from scipy.sparse import csr_matrix

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.feature_engineering import (
    ExtracteurFeaturesTexte,
    ReducteurDimensionnalite,
    CombineurFeatures,
    PipelineFeatures,
)


class TestExtracteurFeaturesTexte:
    """Tests unitaires de ExtracteurFeaturesTexte."""

    def test_tfidf_forme_sortie(self, textes_exemples):
        extracteur = ExtracteurFeaturesTexte(methode="tfidf", nb_features=50, min_df=1)
        resultat = extracteur.adapter_transformer(textes_exemples)
        assert resultat.shape[0] == len(textes_exemples)
        assert resultat.shape[1] <= 50

    def test_count_forme_sortie(self, textes_exemples):
        extracteur = ExtracteurFeaturesTexte(methode="count", nb_features=50, min_df=1)
        resultat = extracteur.adapter_transformer(textes_exemples)
        assert resultat.shape[0] == len(textes_exemples)

    def test_methode_invalide(self):
        with pytest.raises(ValueError):
            ExtracteurFeaturesTexte(methode="inexistante")

    def test_transformer_apres_adapter(self, textes_exemples):
        extracteur = ExtracteurFeaturesTexte(methode="tfidf", nb_features=50, min_df=1)
        extracteur.adapter_transformer(textes_exemples)
        resultat = extracteur.transformer(textes_exemples)
        assert resultat.shape[0] == len(textes_exemples)

    def test_obtenir_noms_features(self, textes_exemples):
        extracteur = ExtracteurFeaturesTexte(methode="tfidf", nb_features=50, min_df=1)
        extracteur.adapter_transformer(textes_exemples)
        noms = extracteur.obtenir_noms_features()
        assert isinstance(noms, np.ndarray)
        assert len(noms) > 0

    def test_matrice_creuse(self, textes_exemples):
        extracteur = ExtracteurFeaturesTexte(methode="tfidf", nb_features=100, min_df=1)
        resultat = extracteur.adapter_transformer(textes_exemples)
        assert isinstance(resultat, csr_matrix)

    def test_valeurs_positives_tfidf(self, textes_exemples):
        extracteur = ExtracteurFeaturesTexte(methode="tfidf", nb_features=50, min_df=1)
        resultat = extracteur.adapter_transformer(textes_exemples)
        assert resultat.data.min() >= 0


class TestReducteurDimensionnalite:
    """Tests unitaires de ReducteurDimensionnalite."""

    def test_svd_reduction(self, features_texte_vectorisees):
        matrice, _ = features_texte_vectorisees
        reducteur = ReducteurDimensionnalite(methode="svd", nb_composantes=5)
        resultat = reducteur.adapter_transformer(matrice)
        assert resultat.shape[1] == 5

    def test_aucune_reduction(self, features_texte_vectorisees):
        matrice, _ = features_texte_vectorisees
        reducteur = ReducteurDimensionnalite(methode="aucune")
        resultat = reducteur.adapter_transformer(matrice)
        assert resultat.shape == matrice.shape

    def test_methode_invalide(self):
        with pytest.raises(ValueError):
            ReducteurDimensionnalite(methode="inexistante")

    def test_transformer_apres_adapter(self, features_texte_vectorisees):
        matrice, _ = features_texte_vectorisees
        reducteur = ReducteurDimensionnalite(methode="svd", nb_composantes=5)
        reducteur.adapter_transformer(matrice)
        resultat = reducteur.transformer(matrice)
        assert resultat.shape[1] == 5

    def test_variance_expliquee_svd(self, features_texte_vectorisees):
        matrice, _ = features_texte_vectorisees
        reducteur = ReducteurDimensionnalite(methode="svd", nb_composantes=5)
        reducteur.adapter_transformer(matrice)
        variance = reducteur.obtenir_variance_expliquee()
        assert variance is not None
        assert len(variance) == 5

    def test_variance_expliquee_aucune(self):
        reducteur = ReducteurDimensionnalite(methode="aucune")
        assert reducteur.obtenir_variance_expliquee() is None


class TestCombineurFeatures:
    """Tests unitaires de CombineurFeatures."""

    def test_concatener_denses(self):
        A = np.random.randn(10, 5)
        B = np.random.randn(10, 3)
        resultat = CombineurFeatures.combiner([A, B], methode="concatener")
        assert resultat.shape == (10, 8)

    def test_concatener_sparse(self):
        A = csr_matrix(np.random.randn(10, 5))
        B = csr_matrix(np.random.randn(10, 3))
        resultat = CombineurFeatures.combiner([A, B], methode="concatener")
        assert resultat.shape == (10, 8)

    def test_empiler(self):
        A = np.random.randn(5, 3)
        B = np.random.randn(5, 3)
        resultat = CombineurFeatures.combiner([A, B], methode="empiler")
        assert resultat.shape == (10, 3)

    def test_methode_invalide(self):
        A = np.random.randn(5, 3)
        with pytest.raises(ValueError):
            CombineurFeatures.combiner([A], methode="inexistante")

    def test_concatener_dense_sparse(self):
        dense = np.random.randn(10, 5)
        sparse = csr_matrix(np.random.randn(10, 3))
        resultat = CombineurFeatures.concatener_dense_sparse(dense, sparse)
        assert resultat.shape == (10, 8)


class TestPipelineFeatures:
    """Tests unitaires de PipelineFeatures."""

    def test_adapter_transformer_texte_seul(self, textes_exemples):
        pipeline = PipelineFeatures(
            methode_texte="tfidf",
            nb_features_texte=50,
            methode_reduction="svd",
            nb_composantes=5,
            min_df=1
        )
        resultat = pipeline.adapter_transformer(textes_exemples)
        assert resultat.shape[0] == len(textes_exemples)
        assert resultat.shape[1] == 5

    def test_transformer_apres_adapter(self, textes_exemples):
        pipeline = PipelineFeatures(
            methode_texte="tfidf",
            nb_features_texte=50,
            methode_reduction="svd",
            nb_composantes=5,
            min_df=1
        )
        pipeline.adapter_transformer(textes_exemples)
        resultat = pipeline.transformer(textes_exemples)
        assert resultat.shape[0] == len(textes_exemples)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
