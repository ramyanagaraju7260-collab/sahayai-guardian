from __future__ import annotations

import numpy as np

from sahayai_x_ai.utils.sensor_processor import augment_sensor_window


def extract_fall_features(sensor_window: list[list[float]], user_age: int, mode: str) -> np.ndarray:
    seq = augment_sensor_window(sensor_window)
    total_acc = seq[:, 8]
    vertical = seq[:, 2]
    free_fall = float(vertical.min() < 0.5)
    impact = float(total_acc.max())
    inactivity = float(np.mean(np.linalg.norm(np.diff(seq[:, :3], axis=0), axis=1) < 0.15))
    orientation_change = float(abs(seq[-1, 2] - seq[0, 2]))
    mode_factor = {"elderly": -0.3, "worker": 0.4, "sports": 0.8}.get(mode, 0.0)
    return np.asarray(
        [
            free_fall,
            impact,
            inactivity,
            orientation_change,
            float(user_age),
            mode_factor,
            float(total_acc.mean()),
            float(total_acc.std()),
        ],
        dtype=float,
    )

