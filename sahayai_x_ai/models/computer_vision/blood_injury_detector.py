from __future__ import annotations

import base64
import io

import numpy as np
from PIL import Image


class BloodInjuryDetector:
    @staticmethod
    def _decode(image_base64: str) -> np.ndarray:
        raw = base64.b64decode(image_base64)
        return np.asarray(Image.open(io.BytesIO(raw)).convert("RGB").resize((224, 224)))

    def analyze(self, image_base64: str) -> dict[str, object]:
        image = self._decode(image_base64)
        red_channel = image[:, :, 0] / 255.0
        darkness = 1.0 - image.mean(axis=2) / 255.0
        blood_score = float(np.clip(np.mean(red_channel * darkness) * 2.0, 0.0, 1.0))
        injury_score = float(np.clip(red_channel.mean() * 1.1, 0.0, 1.0))
        unconscious_score = float(np.clip(darkness.mean() * 0.8, 0.0, 1.0))
        return {
            "injury_detected": injury_score > 0.7,
            "blood_detected": blood_score > 0.6,
            "unconscious_person": unconscious_score > 0.7,
            "scores": {
                "injury_visible": injury_score,
                "blood_detected": blood_score,
                "unconscious_person": unconscious_score,
                "normal": max(0.0, 1 - max(injury_score, blood_score, unconscious_score)),
            },
        }

