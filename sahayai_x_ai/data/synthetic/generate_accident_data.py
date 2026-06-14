from __future__ import annotations

import numpy as np


def generate_accident_dataset(samples: int = 10_000, seed: int = 42) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed)
    windows = np.zeros((samples, 50, 7), dtype=float)
    labels = np.zeros(samples, dtype=int)
    accident_count = int(samples * 0.2)
    labels[:accident_count] = 1
    rng.shuffle(labels)

    for idx, label in enumerate(labels):
        accel = rng.normal(9.81, 2.5, size=(50, 3)) / 9.81
        gyro = rng.normal(0.0, 0.15, size=(50, 3))
        speed = np.clip(rng.normal(14.0, 5.0, size=50), 0.0, 40.0)
        if label == 1:
            impact_start = rng.integers(20, 35)
            impact_len = rng.integers(5, 10)
            spike = rng.uniform(8.0, 15.0)
            accel[impact_start : impact_start + impact_len] += spike
            speed[impact_start:] = np.maximum(0.0, speed[impact_start:] - rng.uniform(8.0, 18.0))
            gyro[impact_start : impact_start + impact_len] += rng.normal(2.0, 0.4, size=(impact_len, 3))
        windows[idx] = np.column_stack([accel, gyro, speed])
    return windows, labels

