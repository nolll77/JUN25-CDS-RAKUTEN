"""
Extraction de caractéristiques visuelles.
Utilise des modèles de Deep Learning pré-entraînés (PyTorch/torchvision).
"""

import logging
from typing import List, Union

import numpy as np
import torch
import torch.nn as nn
from PIL import Image
from torchvision import models, transforms

journal = logging.getLogger(__name__)

class ExtracteurFeaturesImage:
    """Extraction de features via réseaux de neurones pré-entraînés."""

    def __init__(self, modele: str = "resnet50", dispositif: str = None):
        """
        Initialise l'extracteur d'images.

        Args:
            modele: nom du modèle ('resnet50', 'efficientnet_b0', etc.)
            dispositif: 'cpu', 'cuda', or 'mps' (Mac). Auto-détecté si None.
        """
        if dispositif is None:
            if torch.cuda.is_available():
                self.dispositif = torch.device("cuda")
            elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
                self.dispositif = torch.device("mps")
            else:
                self.dispositif = torch.device("cpu")
        else:
            self.dispositif = torch.device(dispositif)

        journal.info(f"Initialisation du modèle vision {modele} sur {self.dispositif}")

        # Chargement du modèle
        if modele == "resnet50":
            base = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
            # On retire la couche de classification finale pour garder les features
            self.modele = nn.Sequential(*list(base.children())[:-1])
        elif modele == "efficientnet_b0":
            base = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
            self.modele = nn.Sequential(*list(base.children())[:-1])
        else:
            raise ValueError(f"Modèle vision {modele} non supporté")

        self.modele.to(self.dispositif)
        self.modele.eval()

        # Transformation standard ImageNet
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def extraire(self, image_input: Union[str, Image.Image]) -> np.ndarray:
        """
        Extrait le vecteur de features d'une image.

        Args:
            image_input: chemin du fichier ou objet PIL.Image

        Returns:
            Vecteur de features (dimension 2048 pour ResNet50)
        """
        try:
            if isinstance(image_input, str):
                img = Image.open(image_input).convert("RGB")
            else:
                img = image_input.convert("RGB")
        except (FileNotFoundError, OSError) as e:
            journal.error(f"Erreur chargement image {image_input}: {e}")
            # Retourner un vecteur nul
            return np.zeros(2048, dtype=np.float32)

        img_t = self.transform(img).unsqueeze(0).to(self.dispositif)

        with torch.no_grad():
            features = self.modele(img_t)
            # Flatten (batch, C, 1, 1) -> (batch, C)
            features = torch.flatten(features, 1)

        return features.cpu().numpy().astype(np.float32)

    def extraire_batch(self, liste_images: List[Union[str, Image.Image]]) -> np.ndarray:
        """Extrait les features pour une liste d'images."""
        return np.vstack([self.extraire(img) for img in liste_images])
