from __future__ import annotations

import numpy as np


def generate_voice_feature_dataset(samples: int = 2000, seed: int = 42) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed)
    features = rng.normal(0.0, 1.0, size=(samples, 140))
    labels = rng.integers(0, 3, size=samples)
    features[labels == 2, :10] += 2.2
    features[labels == 1, :10] += 0.8
    features[labels == 2, 20:35] += 1.8
    return features, labels

