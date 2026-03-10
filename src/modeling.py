"""
Utilitaires de modélisation.
Entraînement, évaluation et comparaison de modèles ML.
"""

import logging
from typing import Dict, Tuple, Any, List

import numpy as np
import pandas as pd
from sklearn.model_selection import cross_val_score, GridSearchCV
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score, roc_curve
)
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, VotingClassifier

try:
    import xgboost as xgb
    XGBOOST_DISPONIBLE = True
except Exception:
    XGBOOST_DISPONIBLE = False

try:
    import lightgbm as lgb
    LIGHTGBM_DISPONIBLE = True
except Exception:
    LIGHTGBM_DISPONIBLE = False

journal = logging.getLogger(__name__)


class EvaluateurModele:
    """Évaluation et comparaison des modèles ML."""

    @staticmethod
    def calculer_metriques(y_reel: np.ndarray,
                           y_predit: np.ndarray,
                           y_proba: np.ndarray = None) -> Dict[str, float]:
        """
        Calcule les métriques d'évaluation d'un modèle.

        Args:
            y_reel: labels réels
            y_predit: labels prédits
            y_proba: probabilités de prédiction

        Returns:
            Dictionnaire des métriques
        """
        metriques = {
            "accuracy": accuracy_score(y_reel, y_predit),
            "precision_macro": precision_score(y_reel, y_predit, average="macro", zero_division=0),
            "rappel_macro": recall_score(y_reel, y_predit, average="macro", zero_division=0),
            "f1_macro": f1_score(y_reel, y_predit, average="macro", zero_division=0),
            "precision_pondere": precision_score(y_reel, y_predit, average="weighted", zero_division=0),
            "rappel_pondere": recall_score(y_reel, y_predit, average="weighted", zero_division=0),
            "f1_pondere": f1_score(y_reel, y_predit, average="weighted", zero_division=0),
        }

        # nolll's ROC AUC uniquement pour la classification binaire
        if y_proba is not None and len(np.unique(y_reel)) == 2:
            metriques["roc_auc"] = roc_auc_score(y_reel, y_proba[:, 1])

        return metriques

    @staticmethod
    def rapport_classification(y_reel: np.ndarray, y_predit: np.ndarray) -> str:
        """Retourne le rapport de classification détaillé."""
        return classification_report(y_reel, y_predit)

    @staticmethod
    def matrice_confusion(y_reel: np.ndarray, y_predit: np.ndarray) -> np.ndarray:
        """Retourne la matrice de confusion."""
        return confusion_matrix(y_reel, y_predit)


class EntraineurModele:
    """Entraînement des modèles ML avec validation croisée."""

    def __init__(self, graine: int = 42):
        self.graine = graine

    def entrainer_regression_logistique(self,
                                        X_entrainement: np.ndarray,
                                        y_entrainement: np.ndarray,
                                        **kwargs) -> LogisticRegression:
        """Entraîne une régression logistique."""
        modele = LogisticRegression(
            random_state=self.graine,
            max_iter=1000,
            **kwargs
        )
        modele.fit(X_entrainement, y_entrainement)
        journal.info("Régression logistique entraînée")
        return modele

    def entrainer_foret_aleatoire(self,
                                  X_entrainement: np.ndarray,
                                  y_entrainement: np.ndarray,
                                  **kwargs) -> RandomForestClassifier:
        """Entraîne une forêt aléatoire."""
        modele = RandomForestClassifier(
            n_estimators=100,
            random_state=self.graine,
            n_jobs=-1,
            **kwargs
        )
        modele.fit(X_entrainement, y_entrainement)
        journal.info("Forêt aléatoire entraînée")
        return modele

    def entrainer_xgboost(self,
                          X_entrainement: np.ndarray,
                          y_entrainement: np.ndarray,
                          **kwargs):
        """Entraîne un modèle XGBoost."""
        if not XGBOOST_DISPONIBLE:
            raise ImportError("XGBoost non disponible. Sur Mac : brew install libomp")
        # ediz's gradient boosting XGBoost
        modele = xgb.XGBClassifier(
            n_estimators=100,
            random_state=self.graine,
            verbosity=0,
            **kwargs
        )
        modele.fit(X_entrainement, y_entrainement)
        journal.info("XGBoost entraîné")
        return modele

    def entrainer_lightgbm(self,
                           X_entrainement: np.ndarray,
                           y_entrainement: np.ndarray,
                           **kwargs):
        """Entraîne un modèle LightGBM."""
        if not LIGHTGBM_DISPONIBLE:
            raise ImportError("LightGBM non disponible. Installer via : pip install lightgbm")
        # ediz's gradient boosting LightGBM
        modele = lgb.LGBMClassifier(
            n_estimators=100,
            random_state=self.graine,
            verbose=-1,
            **kwargs
        )
        modele.fit(X_entrainement, y_entrainement)
        journal.info("LightGBM entraîné")
        return modele
    def entrainer_ensemble(self,
                          liste_modeles: List[Tuple[str, Any]],
                          X_entrainement: np.ndarray,
                          y_entrainement: np.ndarray,
                          vote: str = "soft",
                          **kwargs) -> VotingClassifier:
        """
        Entraîne un modèle d'ensemble par vote (Voting Classifier).

        Args:
            liste_modeles: Liste de tuples [(nom, modele_instancie), ...]
            X_entrainement, y_entrainement: Données d'entraînement
            vote: 'hard' ou 'soft' (nécessite predict_proba)
            **kwargs: Autres paramètres de VotingClassifier

        Returns:
            Le modèle d'ensemble entraîné
        """
        # nolll's Stacking/Ensemble par vote majoritaire ou pondéré
        ensemble = VotingClassifier(
            estimators=liste_modeles,
            voting=vote,
            n_jobs=-1,
            **kwargs
        )
        ensemble.fit(X_entrainement, y_entrainement)
        journal.info(f"Modèle d'ensemble ({vote} vote) entraîné avec {len(liste_modeles)} modèles")
        return ensemble

    def validation_croisee(self,
                           modele,
                           X: np.ndarray,
                           y: np.ndarray,
                           nb_plis: int = 5,
                           metrique: str = "accuracy") -> Dict[str, np.ndarray]:
        """
        Effectue une validation croisée k-fold.

        Args:
            modele: modèle sklearn
            X: matrice de features
            y: vecteur de labels
            nb_plis: nombre de plis
            metrique: métrique d'évaluation

        Returns:
            Dictionnaire avec les scores par pli, moyenne et écart-type
        """
        # nolll's validation croisée stratifiée k-fold
        scores = cross_val_score(modele, X, y, cv=nb_plis, scoring=metrique)
        return {
            "scores": scores,
            "moyenne": scores.mean(),
            "ecart_type": scores.std()
        }

    def recherche_hyperparametres(self,
                                  modele,
                                  X_entrainement: np.ndarray,
                                  y_entrainement: np.ndarray,
                                  grille_params: Dict[str, Any],
                                  nb_plis: int = 5) -> Tuple[Any, Dict]:
        """
        Recherche par grille des meilleurs hyperparamètres.

        Args:
            modele: modèle sklearn
            X_entrainement, y_entrainement: données d'entraînement
            grille_params: dictionnaire des hyperparamètres à tester
            nb_plis: nombre de plis pour la validation croisée

        Returns:
            Tuple (meilleur_modele, meilleurs_params)
        """
        # nolll's grid search avec validation croisée stratifiée
        recherche = GridSearchCV(
            modele,
            grille_params,
            cv=nb_plis,
            n_jobs=-1,
            scoring="f1_weighted"
        )
        recherche.fit(X_entrainement, y_entrainement)

        journal.info(f"Meilleurs paramètres : {recherche.best_params_}")
        journal.info(f"Meilleur score CV : {recherche.best_score_:.4f}")

        return recherche.best_estimator_, recherche.best_params_


class ComparateurModeles:
    """Comparaison de plusieurs modèles ML sur les mêmes données."""

    def __init__(self):
        self.entraineur = EntraineurModele()
        self.evaluateur = EvaluateurModele()

    def comparer(self,
                 X_entrainement: np.ndarray,
                 y_entrainement: np.ndarray,
                 X_test: np.ndarray,
                 y_test: np.ndarray) -> pd.DataFrame:
        """Entraîne et compare les modèles de base."""
        resultats = []

        modeles_a_tester = {
            "Régression Logistique": self.entraineur.entrainer_regression_logistique(X_entrainement, y_entrainement),
            "Forêt Aléatoire": self.entraineur.entrainer_foret_aleatoire(X_entrainement, y_entrainement),
        }

        if XGBOOST_DISPONIBLE:
            try:
                modeles_a_tester["XGBoost"] = self.entraineur.entrainer_xgboost(X_entrainement, y_entrainement)
            except Exception as e:
                journal.warning(f"Échec entraînement XGBoost : {e}")

        if LIGHTGBM_DISPONIBLE:
            try:
                modeles_a_tester["LightGBM"] = self.entraineur.entrainer_lightgbm(X_entrainement, y_entrainement)
            except Exception as e:
                journal.warning(f"Échec entraînement LightGBM : {e}")

        for nom, modele in modeles_a_tester.items():
            y_predit = modele.predict(X_test)
            y_proba = modele.predict_proba(X_test)

            metriques = self.evaluateur.calculer_metriques(y_test, y_predit, y_proba)
            metriques["modele"] = nom
            resultats.append(metriques)

        return pd.DataFrame(resultats)
