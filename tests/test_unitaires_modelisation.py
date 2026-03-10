"""
Tests unitaires — module modeling.
Vérifie l'entraînement, l'évaluation et la comparaison des modèles.
"""

import pytest
import numpy as np
import pandas as pd
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.modeling import EvaluateurModele, EntraineurModele, ComparateurModeles

try:
    import xgboost  # noqa
    XGBOOST_DISPONIBLE = True
except Exception:
    XGBOOST_DISPONIBLE = False

try:
    import lightgbm  # noqa
    LIGHTGBM_DISPONIBLE = True
except Exception:
    LIGHTGBM_DISPONIBLE = False


class TestEvaluateurModele:
    """Tests unitaires de EvaluateurModele."""

    def test_calculer_metriques_binaire(self, donnees_classification_binaire):
        X, y = donnees_classification_binaire
        from sklearn.linear_model import LogisticRegression
        modele = LogisticRegression(random_state=42, max_iter=200)
        modele.fit(X, y)
        y_predit = modele.predict(X)

        evaluateur = EvaluateurModele()
        metriques = evaluateur.calculer_metriques(y, y_predit)

        assert "accuracy" in metriques
        assert "f1_macro" in metriques
        assert "f1_pondere" in metriques
        assert 0.0 <= metriques["accuracy"] <= 1.0

    def test_calculer_metriques_avec_proba(self, donnees_classification_binaire):
        X, y = donnees_classification_binaire
        from sklearn.linear_model import LogisticRegression
        modele = LogisticRegression(random_state=42, max_iter=200)
        modele.fit(X, y)
        y_predit = modele.predict(X)
        y_proba = modele.predict_proba(X)

        evaluateur = EvaluateurModele()
        metriques = evaluateur.calculer_metriques(y, y_predit, y_proba)

        assert "roc_auc" in metriques
        assert 0.0 <= metriques["roc_auc"] <= 1.0

    def test_rapport_classification(self, donnees_classification_binaire):
        X, y = donnees_classification_binaire
        from sklearn.linear_model import LogisticRegression
        modele = LogisticRegression(random_state=42, max_iter=200)
        modele.fit(X, y)
        y_predit = modele.predict(X)

        evaluateur = EvaluateurModele()
        rapport = evaluateur.rapport_classification(y, y_predit)
        assert isinstance(rapport, str)
        assert "precision" in rapport.lower()

    def test_matrice_confusion_forme(self, donnees_classification_binaire):
        X, y = donnees_classification_binaire
        from sklearn.linear_model import LogisticRegression
        modele = LogisticRegression(random_state=42, max_iter=200)
        modele.fit(X, y)
        y_predit = modele.predict(X)

        evaluateur = EvaluateurModele()
        mc = evaluateur.matrice_confusion(y, y_predit)
        assert mc.shape == (2, 2)


class TestEntraineurModele:
    """Tests unitaires de EntraineurModele."""

    def test_regression_logistique(self, donnees_classification_multiclasse):
        X, y = donnees_classification_multiclasse
        entraineur = EntraineurModele(graine=42)
        modele = entraineur.entrainer_regression_logistique(X, y)
        assert hasattr(modele, "predict")
        predictions = modele.predict(X)
        assert len(predictions) == len(y)

    def test_foret_aleatoire(self, donnees_classification_multiclasse):
        X, y = donnees_classification_multiclasse
        entraineur = EntraineurModele(graine=42)
        modele = entraineur.entrainer_foret_aleatoire(X, y)
        assert hasattr(modele, "feature_importances_")
        predictions = modele.predict(X)
        assert len(predictions) == len(y)

    @pytest.mark.skipif(not XGBOOST_DISPONIBLE, reason="XGBoost non disponible (brew install libomp)")
    def test_xgboost(self, donnees_classification_multiclasse):
        X, y = donnees_classification_multiclasse
        entraineur = EntraineurModele(graine=42)
        modele = entraineur.entrainer_xgboost(X, y)
        predictions = modele.predict(X)
        assert len(predictions) == len(y)

    @pytest.mark.skipif(not LIGHTGBM_DISPONIBLE, reason="LightGBM non disponible")
    def test_lightgbm(self, donnees_classification_multiclasse):
        X, y = donnees_classification_multiclasse
        entraineur = EntraineurModele(graine=42)
        modele = entraineur.entrainer_lightgbm(X, y)
        predictions = modele.predict(X)
        assert len(predictions) == len(y)

    def test_validation_croisee(self, donnees_classification_multiclasse):
        X, y = donnees_classification_multiclasse
        from sklearn.linear_model import LogisticRegression
        modele = LogisticRegression(random_state=42, max_iter=200)

        entraineur = EntraineurModele(graine=42)
        resultats = entraineur.validation_croisee(modele, X, y, nb_plis=3)

        assert "scores" in resultats
        assert "moyenne" in resultats
        assert "ecart_type" in resultats
        assert len(resultats["scores"]) == 3

    def test_prediction_dans_plage_valide(self, donnees_classification_multiclasse):
        X, y = donnees_classification_multiclasse
        entraineur = EntraineurModele(graine=42)
        modele = entraineur.entrainer_regression_logistique(X, y)
        predictions = modele.predict(X)
        assert set(predictions).issubset(set(y))


class TestComparateurModeles:
    """Tests de ComparateurModeles."""

    def test_comparer_retourne_dataframe(self, donnees_classification_multiclasse):
        X, y = donnees_classification_multiclasse
        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        comparateur = ComparateurModeles()
        df_resultats = comparateur.comparer(X_train, y_train, X_test, y_test)

        assert isinstance(df_resultats, pd.DataFrame)
        assert "modele" in df_resultats.columns
        assert "f1_macro" in df_resultats.columns
        
        nb_attendus = 2
        if XGBOOST_DISPONIBLE: nb_attendus += 1
        if LIGHTGBM_DISPONIBLE: nb_attendus += 1
        
        assert len(df_resultats) == nb_attendus

    def test_scores_dans_plage_valide(self, donnees_classification_multiclasse):
        X, y = donnees_classification_multiclasse
        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        comparateur = ComparateurModeles()
        df_resultats = comparateur.comparer(X_train, y_train, X_test, y_test)

        for col in ["accuracy", "f1_macro", "f1_pondere"]:
            assert df_resultats[col].between(0, 1).all()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
