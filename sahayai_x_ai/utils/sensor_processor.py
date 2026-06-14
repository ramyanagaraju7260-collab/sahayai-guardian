from __future__ import annotations

import numpy as np


def augment_sensor_window(sensor_window: list[list[float]]) -> np.ndarray:
    window = np.asarray(sensor_window, dtype=float)
    accel = window[:, :3]
    gyro = window[:, 3:6]
    speed = window[:, 6]
    total_acc = np.linalg.norm(accel, axis=1)
    speed_delta = np.gradient(speed)
    jerk = np.gradient(total_acc)
    return np.column_stack([accel, gyro, speed, speed_delta, total_acc, jerk])


def interpolate_missing(values: np.ndarray) -> np.ndarray:
    if not np.isnan(values).any():
        return values
    x = np.arange(len(values))
    mask = ~np.isnan(values)
    values[~mask] = np.interp(x[~mask], x[mask], values[mask])
    return values

