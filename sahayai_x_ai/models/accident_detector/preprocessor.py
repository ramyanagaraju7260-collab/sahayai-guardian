from __future__ import annotations

import numpy as np

from sahayai_x_ai.utils.sensor_processor import augment_sensor_window


def extract_sequence(sensor_window: list[list[float]]) -> np.ndarray:
    return augment_sensor_window(sensor_window)[:, :9]


def _top_fft_components(signal: np.ndarray, top_k: int = 5) -> list[float]:
    spectrum = np.abs(np.fft.rfft(signal))
    if len(spectrum) < top_k:
        spectrum = np.pad(spectrum, (0, top_k - len(spectrum)))
    return spectrum[:top_k].tolist()


def _kurtosis(signal: np.ndarray) -> float:
    centered = signal - signal.mean()
    variance = np.mean(centered**2) + 1e-6
    return float(np.mean(centered**4) / (variance**2))


def _skew(signal: np.ndarray) -> float:
    centered = signal - signal.mean()
    variance = np.mean(centered**2) + 1e-6
    return float(np.mean(centered**3) / (variance ** 1.5))


def extract_features(sensor_window: list[list[float]]) -> np.ndarray:
    seq = augment_sensor_window(sensor_window)
    accel = seq[:, :3]
    speed = seq[:, 6]
    total_acc = seq[:, 8]
    feature_vector: list[float] = []
    for axis in range(accel.shape[1]):
        signal = accel[:, axis]
        feature_vector.extend(
            [
                float(signal.mean()),
                float(signal.std()),
                float(signal.min()),
                float(signal.max()),
                _kurtosis(signal),
                _skew(signal),
                float(np.sum(np.diff(np.signbit(signal)).astype(int))),
                float(np.sum(signal**2)),
            ]
        )
    feature_vector.extend(
        [
            float(speed.mean()),
            float(speed.std()),
            float(speed.max() - speed.min()),
            float(total_acc.max()),
            float(total_acc.mean()),
            float(total_acc.std()),
            float(np.max(np.gradient(total_acc))),
            float(np.mean(np.abs(np.gradient(speed)))),
        ]
    )
    for axis in range(accel.shape[1]):
        feature_vector.extend(_top_fft_components(accel[:, axis]))
    feature_vector.extend(
        [
            float(np.percentile(total_acc, 25)),
            float(np.percentile(total_acc, 50)),
            float(np.percentile(total_acc, 75)),
            float(np.linalg.norm(accel[-1] - accel[0])),
        ]
    )
    return np.asarray(feature_vector[:47], dtype=float)
