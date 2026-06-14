from __future__ import annotations

from sahayai_x_ai.data.synthetic.generate_accident_data import generate_accident_dataset
from sahayai_x_ai.models.accident_detector.model import AccidentDetector
from sahayai_x_ai.models.emergency_classifier.model import EmergencyClassifier


def test_accident_model_predicts_probability() -> None:
    windows, _ = generate_accident_dataset(samples=60)
    result = AccidentDetector().predict(windows[0].tolist())
    assert 0.0 <= result["probability"] <= 1.0


def test_emergency_classifier_returns_label() -> None:
    result = EmergencyClassifier().predict([0.1] * 53)
    assert "emergency_type" in result

