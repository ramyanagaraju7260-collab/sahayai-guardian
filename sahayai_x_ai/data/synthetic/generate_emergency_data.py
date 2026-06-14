from __future__ import annotations

import numpy as np


def generate_emergency_feature_dataset(samples: int = 5000, seed: int = 42) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed)
    features = rng.normal(0.0, 1.0, size=(samples, 53))
    labels = rng.integers(0, 8, size=samples)
    for label in range(8):
        mask = labels == label
        features[mask, label : label + 5] += label * 0.7
    return features, labels
