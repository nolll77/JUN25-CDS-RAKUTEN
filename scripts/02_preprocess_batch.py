"""
Script de prétraitement par lot.
Pipeline complet de prétraitement des données textuelles et numériques.
"""

import logging
import sys
from pathlib import Path

import pandas as pd
import numpy as np

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.utils import (
    configurer_logging, charger_yaml, sauvegarder_pickle, ProfileurPerformance
)
from src.preprocessing import PreprocesseurTexte, NormalisateurNumerique, GestionnaireValeursManquantes
from src.feature_engineering import ExtracteurFeaturesTexte, ReducteurDimensionnalite, CombineurFeatures

configurer_logging()
journal = logging.getLogger(__name__)


def principal():
    """Pipeline complet de prétraitement des données."""

    journal.info("Projet Rakuten — Pipeline de prétraitement")

    profiler = ProfileurPerformance()

    config = charger_yaml("config/config.yaml")

    journal.info("Chargement des données...")
    profiler.demarrer()
    X_entrainement = pd.read_csv(config["data"]["train_csv"])
    y_entrainement = pd.read_csv(config["data"]["labels_csv"]).values.ravel()
    X_test = pd.read_csv(config["data"]["test_csv"])
    profiler.arreter("Chargement données")

    journal.info(f"X_entrainement : {X_entrainement.shape}, y_entrainement : {y_entrainement.shape}, X_test : {X_test.shape}")

    journal.info("Gestion des valeurs manquantes...")
    profiler.demarrer()
    gestionnaire = GestionnaireValeursManquantes(strategie=config["preprocessing"]["missing_values"]["strategie"])
    X_train_complet = gestionnaire.adapter_transformer(X_entrainement)
    X_test_complet = gestionnaire.adapter_transformer(X_test)
    profiler.arreter("Valeurs manquantes")

    journal.info("Prétraitement du texte...")
    profiler.demarrer()
    colonnes_texte = [col for col in X_train_complet.columns if X_train_complet[col].dtype == "object"]

    prep_texte = PreprocesseurTexte(
        minuscules=config["preprocessing"]["text"]["minuscules"],
        supprimer_accents=config["preprocessing"]["text"]["supprimer_accents"],
        supprimer_special=config["preprocessing"]["text"]["supprimer_special"]
    )

    # Concaténation de toutes les colonnes textuelles
    textes_train = X_train_complet[colonnes_texte].astype(str).agg(" ".join, axis=1).values
    textes_test = X_test_complet[colonnes_texte].astype(str).agg(" ".join, axis=1).values

    textes_train_nettoyes = prep_texte.adapter_transformer(textes_train)
    textes_test_nettoyes = prep_texte.adapter_transformer(textes_test)
    profiler.arreter("Prétraitement texte")

    journal.info("Extraction des features textuelles...")
    profiler.demarrer()
    config_fe = config["feature_engineering"]["text"]
    extracteur = ExtracteurFeaturesTexte(
        methode=config_fe["methode"],
        nb_features=config_fe["nb_features"],
        plage_ngram=tuple(config_fe["plage_ngram"])
    )
    features_texte_train = extracteur.adapter_transformer(textes_train_nettoyes)
    features_texte_test = extracteur.transformer(textes_test_nettoyes)
    journal.info(f"Features texte (train) : {features_texte_train.shape}")
    profiler.arreter("Extraction features texte")

    journal.info("Réduction de dimensionnalité...")
    profiler.demarrer()
    config_dim = config["feature_engineering"]["reduction_dimensionnalite"]
    reducteur = ReducteurDimensionnalite(
        methode=config_dim["methode"],
        nb_composantes=config_dim["nb_composantes"]
    )
    features_texte_train_reduites = reducteur.adapter_transformer(features_texte_train)
    features_texte_test_reduites = reducteur.transformer(features_texte_test)
    journal.info(f"Features réduites (train) : {features_texte_train_reduites.shape}")
    profiler.arreter("Réduction dimensionnalité")

    journal.info("Normalisation des variables numériques...")
    profiler.demarrer()
    colonnes_num = X_train_complet.select_dtypes(include=[np.number]).columns
    if len(colonnes_num) > 0:
        normalisateur = NormalisateurNumerique(methode=config["preprocessing"]["numerique"]["methode"])
        X_train_num = normalisateur.adapter_transformer(X_train_complet[colonnes_num])
        X_test_num = normalisateur.transformer(X_test_complet[colonnes_num])
        journal.info(f"Features numériques : {X_train_num.shape}")
    else:
        journal.info("Aucune colonne numérique trouvée")
        X_train_num = None
        X_test_num = None
    profiler.arreter("Normalisation numérique")

    journal.info("Combinaison des features...")
    profiler.demarrer()
    if X_train_num is not None:
        X_train_final = CombineurFeatures.concatener_dense_sparse(
            X_train_num.values,
            features_texte_train_reduites
        )
        X_test_final = CombineurFeatures.concatener_dense_sparse(
            X_test_num.values,
            features_texte_test_reduites
        )
    else:
        X_train_final = features_texte_train_reduites
        X_test_final = features_texte_test_reduites
    profiler.arreter("Combinaison features")

    journal.info(f"Features finales (train) : {X_train_final.shape}")
    journal.info(f"Features finales (test) : {X_test_final.shape}")

    journal.info("Sauvegarde des données prétraitées...")
    profiler.demarrer()
    dossier_sortie = Path(config["output"]["models_dir"])
    dossier_sortie.parent.mkdir(exist_ok=True, parents=True)

    if hasattr(X_train_final, "toarray"):
        X_train_final = X_train_final.toarray()
    if hasattr(X_test_final, "toarray"):
        X_test_final = X_test_final.toarray()

    np.save("data/X_train_preprocessed.npy", X_train_final)
    np.save("data/X_test_preprocessed.npy", X_test_final)
    np.save("data/y_entrainement.npy", y_entrainement)

    sauvegarder_pickle(prep_texte, str(dossier_sortie / "preprocesseur_texte.pkl"))
    sauvegarder_pickle(extracteur, str(dossier_sortie / "extracteur_texte.pkl"))
    sauvegarder_pickle(reducteur, str(dossier_sortie / "reducteur_dim.pkl"))
    profiler.arreter("Sauvegarde")

    journal.info("Rapport de performance :")
    journal.info(profiler.rapport().to_string())
    journal.info("Pipeline de prétraitement terminé.")


if __name__ == "__main__":
    principal()
