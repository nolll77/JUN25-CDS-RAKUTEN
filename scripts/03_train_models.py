"""
Script d'entraînement des modèles.
Entraîne les modèles de base et compare leurs performances.
"""

import logging
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.utils import configurer_logging, charger_yaml, sauvegarder_pickle, ProfileurPerformance
from src.modeling import EntraineurModele, EvaluateurModele

configurer_logging()
journal = logging.getLogger(__name__)


def principal():
    """Entraînement et comparaison des modèles de base."""

    journal.info("Projet Rakuten — Entraînement des modèles")

    profiler = ProfileurPerformance()

    config = charger_yaml("config/config.yaml")

    journal.info("Chargement des données prétraitées...")
    profiler.demarrer()
    X_entrainement = np.load("data/X_train_preprocessed.npy")
    y_entrainement = np.load("data/y_entrainement.npy")
    X_test = np.load("data/X_test_preprocessed.npy")
    profiler.arreter("Chargement données")

    journal.info(f"X_entrainement : {X_entrainement.shape}, y_entrainement : {y_entrainement.shape}")

    # nolll's découpage stratifié train/validation
    journal.info("Découpage entraînement / validation...")
    X_train, X_validation, y_train, y_validation = train_test_split(
        X_entrainement, y_entrainement,
        test_size=config["modeling"]["taille_test"],
        random_state=config["modeling"]["graine"],
        stratify=y_entrainement
    )
    journal.info(f"Entraînement : {X_train.shape}, Validation : {X_validation.shape}")

    entraineur = EntraineurModele(graine=config["modeling"]["graine"])
    evaluateur = EvaluateurModele()

    resultats = []
    modeles = {}

    journal.info("Entraînement — Régression Logistique...")
    profiler.demarrer()
    modele_rl = entraineur.entrainer_regression_logistique(X_train, y_train)
    profiler.arreter("Régression Logistique")

    y_predit = modele_rl.predict(X_validation)
    y_proba = modele_rl.predict_proba(X_validation)
    metriques = evaluateur.calculer_metriques(y_validation, y_predit, y_proba)
    metriques["modele"] = "Régression Logistique"
    resultats.append(metriques)
    modeles["rl"] = modele_rl
    journal.info(f"F1 (macro) : {metriques['f1_macro']:.4f}")

    journal.info("Entraînement — Forêt Aléatoire...")
    profiler.demarrer()
    modele_fa = entraineur.entrainer_foret_aleatoire(X_train, y_train)
    profiler.arreter("Forêt Aléatoire")

    y_predit = modele_fa.predict(X_validation)
    y_proba = modele_fa.predict_proba(X_validation)
    metriques = evaluateur.calculer_metriques(y_validation, y_predit, y_proba)
    metriques["modele"] = "Forêt Aléatoire"
    resultats.append(metriques)
    modeles["fa"] = modele_fa
    journal.info(f"F1 (macro) : {metriques['f1_macro']:.4f}")

    journal.info("Entraînement — XGBoost...")
    profiler.demarrer()
    modele_xgb = entraineur.entrainer_xgboost(X_train, y_train)
    profiler.arreter("XGBoost")

    y_predit = modele_xgb.predict(X_validation)
    y_proba = modele_xgb.predict_proba(X_validation)
    metriques = evaluateur.calculer_metriques(y_validation, y_predit, y_proba)
    metriques["modele"] = "XGBoost"
    resultats.append(metriques)
    modeles["xgb"] = modele_xgb
    journal.info(f"F1 (macro) : {metriques['f1_macro']:.4f}")

    journal.info("Entraînement — LightGBM...")
    profiler.demarrer()
    modele_lgb = entraineur.entrainer_lightgbm(X_train, y_train)
    profiler.arreter("LightGBM")

    y_predit = modele_lgb.predict(X_validation)
    y_proba = modele_lgb.predict_proba(X_validation)
    metriques = evaluateur.calculer_metriques(y_validation, y_predit, y_proba)
    metriques["modele"] = "LightGBM"
    resultats.append(metriques)
    modeles["lgb"] = modele_lgb
    journal.info(f"F1 (macro) : {metriques['f1_macro']:.4f}")

    journal.info("Comparaison des modèles :")
    df_resultats = pd.DataFrame(resultats)
    journal.info(df_resultats.to_string())

    Path("reports").mkdir(exist_ok=True)
    df_resultats.to_csv("reports/comparaison_modeles.csv", index=False)
    journal.info("Résultats sauvegardés : reports/comparaison_modeles.csv")

    meilleur_nom = df_resultats.loc[df_resultats["f1_macro"].idxmax(), "modele"]
    idx_meilleur = resultats.index(max(resultats, key=lambda x: x["f1_macro"]))
    meilleur_modele = modeles[list(modeles.keys())[idx_meilleur]]

    dossier_modeles = Path(config["output"]["models_dir"])
    dossier_modeles.mkdir(parents=True, exist_ok=True)
    sauvegarder_pickle(meilleur_modele, str(dossier_modeles / "meilleur_modele.pkl"))
    journal.info(f"Meilleur modèle ({meilleur_nom}) sauvegardé")

    journal.info("Rapport de performance :")
    journal.info(profiler.rapport().to_string())
    journal.info("Entraînement terminé.")


if __name__ == "__main__":
    principal()
