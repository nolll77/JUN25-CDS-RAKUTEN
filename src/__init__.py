"""
JUN25-CDS-RAKUTEN : Pipeline ML Classification Produits Rakuten
"""

__version__ = "0.1.0"
__auteurs__ = "nolll, ediz"
__projet__ = "JUN25-CDS-RAKUTEN"

from . import preprocessing
from . import feature_engineering
from . import modeling
from . import visualization
from . import utils

__all__ = [
    "preprocessing",
    "feature_engineering",
    "modeling",
    "visualization",
    "utils",
]
