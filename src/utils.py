"""
Fonctions utilitaires générales.
Logging, sauvegarde, chargement, validation et profilage.
"""

import logging
import pickle
import json
from pathlib import Path
from typing import Any, Dict, List

import numpy as np
import pandas as pd
import yaml

journal = logging.getLogger(__name__)


def configurer_logging(fichier_log: str = "logs/app.log", niveau: int = logging.INFO):
    """Configure le système de journalisation."""
    Path("logs").mkdir(exist_ok=True)

    logging.basicConfig(
        level=niveau,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler(fichier_log),
            logging.StreamHandler()
        ]
    )


def sauvegarder_pickle(objet: Any, chemin: str):
    """Sauvegarde un objet Python en fichier pickle."""
    with open(chemin, "wb") as f:
        pickle.dump(objet, f)
    journal.info(f"Sauvegardé : {chemin}")


def charger_pickle(chemin: str) -> Any:
    """Charge un objet Python depuis un fichier pickle."""
    with open(chemin, "rb") as f:
        objet = pickle.load(f)
    journal.info(f"Chargé : {chemin}")
    return objet


def sauvegarder_json(donnees: Dict, chemin: str):
    """Sauvegarde des données en fichier JSON."""
    with open(chemin, "w") as f:
        json.dump(donnees, f, indent=4)
    journal.info(f"Sauvegardé : {chemin}")


def charger_json(chemin: str) -> Dict:
    """Charge des données depuis un fichier JSON."""
    with open(chemin, "r") as f:
        donnees = json.load(f)
    journal.info(f"Chargé : {chemin}")
    return donnees


def charger_yaml(chemin: str) -> Dict:
    """Charge la configuration depuis un fichier YAML."""
    with open(chemin, "r") as f:
        donnees = yaml.safe_load(f)
    journal.info(f"Configuration chargée : {chemin}")
    return donnees


def sauvegarder_dataframe(df: pd.DataFrame, chemin: str, format: str = "csv"):
    """Sauvegarde un dataframe dans un fichier."""
    if format == "csv":
        df.to_csv(chemin, index=False)
    elif format == "parquet":
        df.to_parquet(chemin, index=False)
    else:
        raise ValueError(f"Format {format} non supporté")
    journal.info(f"Dataframe sauvegardé : {chemin}")


def charger_dataframe(chemin: str, format: str = "csv") -> pd.DataFrame:
    """Charge un dataframe depuis un fichier."""
    if format == "csv":
        df = pd.read_csv(chemin)
    elif format == "parquet":
        df = pd.read_parquet(chemin)
    else:
        raise ValueError(f"Format {format} non supporté")
    journal.info(f"Dataframe chargé : {chemin}")
    return df


class ValidateurDonnees:
    """Validation de la cohérence des données."""

    @staticmethod
    def verifier_valeurs_manquantes(df: pd.DataFrame) -> Dict[str, float]:
        """Retourne le pourcentage de valeurs manquantes par colonne."""
        pct_manquant = (df.isnull().sum() / len(df)) * 100
        return pct_manquant[pct_manquant > 0].to_dict()

    @staticmethod
    def verifier_doublons(df: pd.DataFrame) -> int:
        """Retourne le nombre de lignes dupliquées."""
        return df.duplicated().sum()

    @staticmethod
    def verifier_types_colonnes(df: pd.DataFrame) -> Dict[str, str]:
        """Retourne les types de données par colonne."""
        return df.dtypes.astype(str).to_dict()

    @staticmethod
    def valider_colonnes(df: pd.DataFrame, colonnes_attendues: List[str]) -> bool:
        """Vérifie que le dataframe contient les colonnes attendues."""
        colonnes_manquantes = set(colonnes_attendues) - set(df.columns)
        if colonnes_manquantes:
            journal.warning(f"Colonnes manquantes : {colonnes_manquantes}")
            return False
        return True


class ProfileurPerformance:
    """Mesure du temps d'exécution par étape."""

    def __init__(self):
        import time
        self.debut = None
        self.temps = {}

    def demarrer(self):
        """Démarre le chronomètre."""
        import time
        self.debut = time.time()

    def arreter(self, nom: str = "operation"):
        """Arrête le chronomètre et enregistre le temps."""
        import time
        if self.debut is None:
            journal.warning("Le chronomètre n'a pas été démarré")
            return

        ecoule = time.time() - self.debut
        self.temps[nom] = ecoule
        journal.info(f"{nom} : {ecoule:.4f} secondes")
        self.debut = None

    def rapport(self) -> pd.DataFrame:
        """Retourne un rapport de performance sous forme de dataframe."""
        return pd.DataFrame(list(self.temps.items()), columns=["Étape", "Durée (s)"])


def decouper_train_test(X: pd.DataFrame,
                        y: pd.Series,
                        taille_test: float = 0.2,
                        graine: int = 42) -> tuple:
    """
    Découpe les données en ensembles d'entraînement et de test en conservant les indices.

    Args:
        X: matrice de features
        y: vecteur de labels
        taille_test: proportion de l'ensemble de test
        graine: graine aléatoire pour la reproductibilité

    Returns:
        Tuple (X_train, X_test, y_train, y_test, idx_train, idx_test)
    """
    from sklearn.model_selection import train_test_split

    # nolll's découpage stratifié pour conserver la distribution des classes
    indices = np.arange(len(X))
    idx_train, idx_test = train_test_split(
        indices,
        test_size=taille_test,
        random_state=graine,
        stratify=y
    )

    return (X.iloc[idx_train], X.iloc[idx_test],
            y.iloc[idx_train], y.iloc[idx_test],
            idx_train, idx_test)
