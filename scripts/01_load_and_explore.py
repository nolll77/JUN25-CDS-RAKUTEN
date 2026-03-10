"""
Script de chargement et d'exploration des données.
Charge les données brutes, effectue une exploration de base et valide leur cohérence.
"""

import logging
import sys
from pathlib import Path

import pandas as pd
import numpy as np

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.utils import configurer_logging, charger_yaml, ValidateurDonnees
from src.preprocessing import PreprocesseurTexte

configurer_logging()
journal = logging.getLogger(__name__)


def principal():
    """Chargement et exploration des données brutes."""

    journal.info("Projet Rakuten — Chargement et exploration des données")

    config = charger_yaml("config/config.yaml")

    journal.info("Chargement des données...")
    X_entrainement = pd.read_csv(config["data"]["train_csv"])
    y_entrainement = pd.read_csv(config["data"]["labels_csv"])
    X_test = pd.read_csv(config["data"]["test_csv"])

    journal.info(f"X_entrainement : {X_entrainement.shape}")
    journal.info(f"y_entrainement : {y_entrainement.shape}")
    journal.info(f"X_test : {X_test.shape}")

    journal.info("Validation des données...")
    validateur = ValidateurDonnees()

    valeurs_manquantes = validateur.verifier_valeurs_manquantes(X_entrainement)
    if valeurs_manquantes:
        journal.info(f"Valeurs manquantes (X_entrainement) : {valeurs_manquantes}")
    else:
        journal.info("Aucune valeur manquante dans X_entrainement")

    nb_doublons = validateur.verifier_doublons(X_entrainement)
    journal.info(f"Lignes dupliquées dans X_entrainement : {nb_doublons}")

    journal.info("Informations sur les données d'entraînement :")
    journal.info(f"Colonnes : {X_entrainement.columns.tolist()}")
    journal.info(f"Types :\n{X_entrainement.dtypes}")
    journal.info(f"Premiers exemples :\n{X_entrainement.head(3).to_string()}")

    journal.info("Distribution des classes :")
    journal.info(y_entrainement.value_counts().to_string())

    journal.info("Chargement et exploration terminés.")


if __name__ == "__main__":
    principal()
