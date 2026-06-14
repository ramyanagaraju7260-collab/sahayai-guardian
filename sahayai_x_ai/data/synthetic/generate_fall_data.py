from __future__ import annotations

import numpy as np


def generate_fall_dataset(samples: int = 3000, seed: int = 42) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed)
    windows = np.zeros((samples, 50, 7), dtype=float)
    labels = np.zeros(samples, dtype=int)
    labels[: samples // 3] = 1
    labels[samples // 3 : 2 * samples // 3] = 2
    rng.shuffle(labels)

    for idx, label in enumerate(labels):
        accel = rng.normal(1.0, 0.15, size=(50, 3))
        gyro = rng.normal(0.0, 0.2, size=(50, 3))
        speed = np.zeros(50)
        if label in (1, 2):
            accel[10:18, 2] = rng.uniform(0.1, 0.45)
            impact = rng.uniform(3.0, 4.2) if label == 1 else rng.uniform(4.5, 7.0)
            accel[18:22] += impact
            accel[22:] = rng.normal(0.05, 0.03, size=(28, 3))
        windows[idx] = np.column_stack([accel, gyro, speed])
    return windows, labels

