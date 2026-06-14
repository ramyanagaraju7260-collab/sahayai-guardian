from __future__ import annotations

import base64
import io

import numpy as np
from PIL import Image


class FaceDistressAnalyzer:
    @staticmethod
    def _decode(image_base64: str) -> np.ndarray:
        raw = base64.b64decode(image_base64)
        return np.asarray(Image.open(io.BytesIO(raw)).convert("L").resize((128, 128)))

    def analyze(self, image_base64: str) -> dict[str, object]:
        image = self._decode(image_base64)
        contrast = float(image.std() / 128.0)
        brightness = float(image.mean() / 255.0)
        fear = float(np.clip(contrast * 0.9, 0.0, 1.0))
        pain = float(np.clip((1 - brightness) * 0.9, 0.0, 1.0))
        unconscious = float(np.clip((1 - contrast) * (1 - brightness), 0.0, 1.0))
        distress = fear * 0.4 + pain * 0.4 + unconscious * 0.2
        return {
            "emotion_scores": {
                "calm": max(0.0, 1 - distress),
                "fear": fear,
                "pain": pain,
                "unconscious": unconscious,
            },
            "face_distress_score": float(np.clip(distress, 0.0, 1.0)),
        }

