from __future__ import annotations

from pathlib import Path

from sahayai_x_ai.config import MODEL_CACHE_DIR
from sahayai_x_ai.models.accident_detector.model import AccidentDetector
from sahayai_x_ai.models.emergency_classifier.model import EmergencyClassifier
from sahayai_x_ai.models.fall_detector.model import FallDetector
from sahayai_x_ai.models.severity_predictor.model import SeverityPredictor
from sahayai_x_ai.models.voice_panic_detector.model import VoicePanicDetector


def train_all_models() -> dict[str, object]:
    return {
        "accident_detector": AccidentDetector().train(),
        "fall_detector": FallDetector().train(),
        "emergency_classifier": EmergencyClassifier().train(),
        "severity_predictor": SeverityPredictor().train(),
        "voice_panic_detector": VoicePanicDetector().train(),
    }


def ensure_models_ready() -> dict[str, object]:
    expected = [
        MODEL_CACHE_DIR / "accident_detector.pkl",
        MODEL_CACHE_DIR / "fall_detector.pkl",
        MODEL_CACHE_DIR / "emergency_classifier.pkl",
        MODEL_CACHE_DIR / "severity_predictor.pkl",
        MODEL_CACHE_DIR / "voice_panic_detector.pkl",
    ]
    if all(Path(path).exists() for path in expected):
        AccidentDetector().load()
        FallDetector().load()
        EmergencyClassifier().load()
        SeverityPredictor().load()
        VoicePanicDetector().load()
        return {"status": "loaded"}
    return {"status": "trained", "details": train_all_models()}
