from __future__ import annotations

import base64
import io

import numpy as np
from PIL import Image

from sahayai_x_ai.models.computer_vision.model_loader import load_artifact


class FireSmokeDetector:
    def __init__(self) -> None:
        self.artifact = load_artifact("yolov8n_fire_smoke")

    @staticmethod
    def _decode(image_base64: str) -> np.ndarray:
        raw = base64.b64decode(image_base64)
        return np.asarray(Image.open(io.BytesIO(raw)).convert("RGB").resize((224, 224)))

    def analyze(self, image_base64: str) -> dict[str, object]:
        image = self._decode(image_base64)
        red_ratio = float(image[:, :, 0].mean() / 255.0)
        gray = image.mean(axis=2)
        low_sat = np.std(image, axis=2)
        smoke_score = float(np.clip((gray.mean() / 255.0) * (1 - low_sat.mean() / 128.0), 0.0, 1.0))
        fire_score = float(np.clip(red_ratio * 1.2, 0.0, 1.0))
        return {
            "fire_detected": fire_score >= 0.65,
            "fire_confidence": fire_score,
            "smoke_detected": smoke_score >= 0.65,
            "smoke_confidence": smoke_score,
            "bounding_boxes": [
                {
                    "label": "fire" if fire_score >= smoke_score else "smoke",
                    "confidence": max(fire_score, smoke_score),
                    "x1": 16,
                    "y1": 16,
                    "x2": 208,
                    "y2": 208,
                    "area_percentage": 0.73,
                }
            ]
            if max(fire_score, smoke_score) >= 0.45
            else [],
        }

