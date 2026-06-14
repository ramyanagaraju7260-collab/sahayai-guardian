from __future__ import annotations

import numpy as np


def detect_signal_anomaly(scores: dict[str, float]) -> float:
    values = np.asarray(list(scores.values()), dtype=float)
    if values.size == 0:
        return 0.0
    return float(np.clip(values.std() + values.max() * 0.2, 0.0, 1.0))

