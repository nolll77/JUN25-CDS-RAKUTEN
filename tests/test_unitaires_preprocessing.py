"""
Tests unitaires — module preprocessing.
Vérifie le comportement de chaque classe indépendamment.
"""

import pytest
import numpy as np
import pandas as pd
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.preprocessing import PreprocesseurTexte, NormalisateurNumerique, GestionnaireValeursManquantes


class TestPreprocesseurTexte:
    """Tests unitaires de PreprocesseurTexte."""

    def test_minuscules(self):
        prep = PreprocesseurTexte(minuscules=True)
        assert prep.nettoyer_texte("HELLO WORLD") == "hello world"

    def test_minuscules_desactive(self):
        prep = PreprocesseurTexte(minuscules=False, supprimer_accents=False, supprimer_special=False)
        assert prep.nettoyer_texte("HELLO") == "HELLO"

    def test_texte_vide(self):
        prep = PreprocesseurTexte()
        assert prep.nettoyer_texte("") == ""

    def test_non_chaine(self):
        prep = PreprocesseurTexte()
        assert prep.nettoyer_texte(None) == ""
        assert prep.nettoyer_texte(42) == ""

    def test_suppression_caracteres_speciaux(self):
        prep = PreprocesseurTexte(supprimer_special=True)
        resultat = prep.nettoyer_texte("Hello, World!")
        assert "," not in resultat
        assert "!" not in resultat

    def test_suppression_accents(self):
        prep = PreprocesseurTexte(supprimer_accents=True, minuscules=False, supprimer_special=False)
        resultat = prep.nettoyer_texte("éàü")
        assert "é" not in resultat
        assert "à" not in resultat
        assert "ü" not in resultat

    def test_suppression_espaces_multiples(self):
        prep = PreprocesseurTexte(supprimer_special=False, supprimer_accents=False, minuscules=False)
        resultat = prep.nettoyer_texte("hello   world")
        assert "  " not in resultat

    def test_adapter_transformer_liste(self, textes_exemples):
        prep = PreprocesseurTexte()
        resultats = prep.adapter_transformer(textes_exemples)
        assert len(resultats) == len(textes_exemples)
        assert all(isinstance(r, str) for r in resultats)

    def test_adapter_transformer_liste_vide(self):
        prep = PreprocesseurTexte()
        assert prep.adapter_transformer([]) == []


class TestNormalisateurNumerique:
    """Tests unitaires de NormalisateurNumerique."""

    def test_methode_standard(self, dataframe_numerique):
        norm = NormalisateurNumerique(methode="standard")
        resultat = norm.adapter_transformer(dataframe_numerique)
        # La moyenne doit être proche de 0 après StandardScaler
        assert abs(resultat["prix"].mean()) < 0.1

    def test_methode_minmax_bornes(self, dataframe_numerique):
        norm = NormalisateurNumerique(methode="minmax")
        resultat = norm.adapter_transformer(dataframe_numerique)
        assert resultat["prix"].min() >= 0.0
        assert resultat["prix"].max() <= 1.0

    def test_methode_invalide(self):
        with pytest.raises(ValueError):
            NormalisateurNumerique(methode="inexistante")

    def test_transformer_apres_adapter(self, dataframe_numerique):
        norm = NormalisateurNumerique(methode="standard")
        norm.adapter_transformer(dataframe_numerique)
        resultat = norm.transformer(dataframe_numerique)
        assert resultat.shape == dataframe_numerique.shape

    def test_conservation_colonnes(self, dataframe_numerique):
        norm = NormalisateurNumerique(methode="standard")
        resultat = norm.adapter_transformer(dataframe_numerique)
        assert list(resultat.columns) == list(dataframe_numerique.columns)


class TestGestionnaireValeursManquantes:
    """Tests unitaires de GestionnaireValeursManquantes."""

    def test_strategie_moyenne(self, dataframe_avec_manquants):
        gestionnaire = GestionnaireValeursManquantes(strategie="moyenne")
        resultat = gestionnaire.adapter_transformer(dataframe_avec_manquants)
        assert resultat["prix"].isnull().sum() == 0
        assert resultat["poids"].isnull().sum() == 0

    def test_strategie_mediane(self, dataframe_avec_manquants):
        gestionnaire = GestionnaireValeursManquantes(strategie="mediane")
        resultat = gestionnaire.adapter_transformer(dataframe_avec_manquants)
        assert resultat["prix"].isnull().sum() == 0

    def test_strategie_propagation(self, dataframe_avec_manquants):
        gestionnaire = GestionnaireValeursManquantes(strategie="propagation")
        resultat = gestionnaire.adapter_transformer(dataframe_avec_manquants)
        assert resultat["prix"].isnull().sum() == 0

    def test_strategie_suppression(self, dataframe_avec_manquants):
        gestionnaire = GestionnaireValeursManquantes(strategie="suppression")
        resultat = gestionnaire.adapter_transformer(dataframe_avec_manquants)
        assert resultat.isnull().sum().sum() == 0
        assert len(resultat) < len(dataframe_avec_manquants)

    def test_sans_valeurs_manquantes(self, dataframe_numerique):
        gestionnaire = GestionnaireValeursManquantes(strategie="moyenne")
        resultat = gestionnaire.adapter_transformer(dataframe_numerique)
        assert resultat.shape == dataframe_numerique.shape


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
