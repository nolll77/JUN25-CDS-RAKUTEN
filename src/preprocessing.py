"""
Utilitaires de prétraitement des données.
Nettoyage de texte, traitement d'images, extraction de caractéristiques.
"""

import re
import string
import logging
from pathlib import Path
from typing import List, Tuple, Union

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from PIL import Image
import torch
import torchvision.transforms as transformations
from torchvision.models import resnet50

journal = logging.getLogger(__name__)


class PreprocesseurTexte:
    """Nettoyage et prétraitement des données textuelles."""

    def __init__(self, minuscules=True, supprimer_accents=True, supprimer_special=True):
        self.minuscules = minuscules
        self.supprimer_accents = supprimer_accents
        self.supprimer_special = supprimer_special

    def nettoyer_texte(self, texte: str) -> str:
        """
        Nettoie un texte brut.

        Args:
            texte: chaîne de caractères brute

        Returns:
            Chaîne nettoyée
        """
        if not isinstance(texte, str):
            return ""

        if self.minuscules:
            texte = texte.lower()

        if self.supprimer_accents:
            texte = self._enlever_accents(texte)

        if self.supprimer_special:
            texte = re.sub(f"[{re.escape(string.punctuation)}]", " ", texte)

        texte = " ".join(texte.split())

        return texte

    @staticmethod
    def _enlever_accents(texte: str) -> str:
        """Supprime les accents d'un texte."""
        import unicodedata
        nfkd = unicodedata.normalize("NFKD", texte)
        return "".join([c for c in nfkd if not unicodedata.combining(c)])

    def adapter_transformer(self, textes: List[str]) -> List[str]:
        """Nettoie une liste de textes."""
        return [self.nettoyer_texte(t) for t in textes]


class PreprocesseurImage:
    """Extraction de caractéristiques d'images via des modèles pré-entraînés."""

    def __init__(self, nom_modele: str = "resnet50", dispositif: str = "cpu"):
        """
        Initialise le préprocesseur d'images.

        Args:
            nom_modele: modèle pré-entraîné à utiliser ('resnet50')
            dispositif: 'cpu' ou 'cuda'
        """
        self.nom_modele = nom_modele
        self.dispositif = dispositif
        self.modele = self._charger_modele()

        # nolll's transformation standard ImageNet
        self.transformation = transformations.Compose([
            transformations.Resize((224, 224)),
            transformations.ToTensor(),
            transformations.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def _charger_modele(self):
        """Charge le modèle pré-entraîné et supprime la couche de classification finale."""
        if self.nom_modele == "resnet50":
            # nolll's extraction des features sans la couche de classification
            modele = resnet50(pretrained=True)
            modele = torch.nn.Sequential(*list(modele.children())[:-1])
        else:
            raise ValueError(f"Modèle {self.nom_modele} non supporté")

        modele = modele.to(self.dispositif)
        modele.eval()
        return modele

    def extraire_features(self, chemin_image: Union[str, Path]) -> np.ndarray:
        """
        Extrait les caractéristiques d'une image.

        Args:
            chemin_image: chemin vers le fichier image

        Returns:
            Vecteur de caractéristiques (2048,) pour ResNet50
        """
        try:
            image = Image.open(chemin_image).convert("RGB")
            image = self.transformation(image).unsqueeze(0).to(self.dispositif)

            with torch.no_grad():
                features = self.modele(image)

            return features.cpu().numpy().reshape(-1)
        except Exception as e:
            journal.error(f"Erreur extraction features {chemin_image}: {e}")
            return np.zeros(2048)

    def extraire_features_batch(self, chemins_images: List[str]) -> np.ndarray:
        """Extrait les caractéristiques d'une liste d'images."""
        features = []
        for chemin in chemins_images:
            feat = self.extraire_features(chemin)
            features.append(feat)
        return np.array(features)


class NormalisateurNumerique:
    """Normalisation des variables numériques."""

    def __init__(self, methode: str = "standard"):
        """
        Initialise le normalisateur.

        Args:
            methode: 'standard' (StandardScaler) ou 'minmax' (MinMaxScaler)
        """
        if methode == "standard":
            # nolll's normalisation Z-score : (x - moyenne) / écart-type
            self.scaler = StandardScaler()
        elif methode == "minmax":
            # nolll's normalisation min-max : (x - min) / (max - min)
            self.scaler = MinMaxScaler()
        else:
            raise ValueError(f"Méthode {methode} non supportée")

    def adapter_transformer(self, X: pd.DataFrame) -> pd.DataFrame:
        """Ajuste et transforme les colonnes numériques."""
        colonnes_num = X.select_dtypes(include=[np.number]).columns
        X_normalise = X.copy()
        X_normalise[colonnes_num] = self.scaler.fit_transform(X[colonnes_num])
        return X_normalise

    def transformer(self, X: pd.DataFrame) -> pd.DataFrame:
        """Transforme les colonnes numériques avec le scaler ajusté."""
        colonnes_num = X.select_dtypes(include=[np.number]).columns
        X_normalise = X.copy()
        X_normalise[colonnes_num] = self.scaler.transform(X[colonnes_num])
        return X_normalise


class GestionnaireValeursManquantes:
    """Traitement des valeurs manquantes."""

    def __init__(self, strategie: str = "moyenne"):
        """
        Initialise le gestionnaire.

        Args:
            strategie: 'moyenne', 'mediane', 'propagation', 'suppression'
        """
        self.strategie = strategie

    def adapter_transformer(self, X: pd.DataFrame) -> pd.DataFrame:
        """Applique la stratégie de remplacement des valeurs manquantes."""
        X_rempli = X.copy()

        if self.strategie == "moyenne":
            X_rempli = X_rempli.fillna(X_rempli.mean(numeric_only=True))
        elif self.strategie == "mediane":
            X_rempli = X_rempli.fillna(X_rempli.median(numeric_only=True))
        elif self.strategie == "propagation":
            X_rempli = X_rempli.ffill().bfill()
        elif self.strategie == "suppression":
            X_rempli = X_rempli.dropna()

        return X_rempli
