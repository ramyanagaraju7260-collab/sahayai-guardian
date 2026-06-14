from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import numpy as np
try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.metrics import classification_report
    from sklearn.model_selection import train_test_split
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler

    SKLEARN_READY = True
except Exception:  # pragma: no cover
    RandomForestClassifier = classification_report = train_test_split = Pipeline = StandardScaler = None
    SKLEARN_READY = False

from sahayai_x_ai.config import MODEL_CACHE_DIR
from sahayai_x_ai.data.synthetic.generate_fall_data import generate_fall_dataset
from sahayai_x_ai.models.fall_detector.preprocessor import extract_fall_features


class FallDetector:
    def __init__(self, model_dir: Path | None = None) -> None:
        self.model_path = (model_dir or MODEL_CACHE_DIR) / "fall_detector.pkl"
        self.ready = False

    def train(self, samples: int = 3000) -> dict[str, float]:
        windows, labels = generate_fall_dataset(samples=samples)
        features = np.asarray(
            [extract_fall_features(window.tolist(), 60 if label else 35, "elderly") for window, label in zip(windows, labels)]
        )
        if not SKLEARN_READY:
            bundle = {"mode": "heuristic", "impact_minor": 3.0, "impact_severe": 4.8}
            joblib.dump(bundle, self.model_path)
            self.bundle = bundle
            self.ready = True
            return {"accuracy": 0.0, "macro_f1": 0.0}
        x_train, x_test, y_train, y_test = train_test_split(
            features, labels, test_size=0.25, random_state=42, stratify=labels
        )
        pipeline = Pipeline(
            [
                ("scaler", StandardScaler()),
                ("clf", RandomForestClassifier(n_estimators=150, random_state=42)),
            ]
        )
        pipeline.fit(x_train, y_train)
        joblib.dump(pipeline, self.model_path)
        self.bundle = pipeline
        self.ready = True
        report = classification_report(y_test, pipeline.predict(x_test), output_dict=True)
        return {"accuracy": report["accuracy"], "macro_f1": report["macro avg"]["f1-score"]}

    def load(self) -> None:
        if not self.model_path.exists():
            self.train()
        self.bundle = joblib.load(self.model_path)
        self.ready = True

    def predict(self, sensor_window: list[list[float]], user_age: int = 35, mode: str = "default") -> dict[str, Any]:
        if not self.ready:
            self.load()
        features = extract_fall_features(sensor_window, user_age, mode).reshape(1, -1)
        if isinstance(self.bundle, dict) and self.bundle.get("mode") == "heuristic":
            impact = float(features[0, 1])
            if impact >= self.bundle["impact_severe"]:
                probabilities = np.asarray([0.02, 0.18, 0.80])
            elif impact >= self.bundle["impact_minor"]:
                probabilities = np.asarray([0.10, 0.76, 0.14])
            else:
                probabilities = np.asarray([0.90, 0.08, 0.02])
        else:
            probabilities = self.bundle.predict_proba(features)[0]
        label = int(np.argmax(probabilities))
        classes = ["normal", "fall_minor", "fall_severe"]
        impact_threshold = {"elderly": 1.5, "worker": 5.0, "sports": 6.0}.get(mode, 3.0)
        impact_value = float(features[0, 1])
        free_fall = bool(features[0, 0] > 0.5)
        inactivity = float(features[0, 2])
        post_fall_detected = free_fall and impact_value >= impact_threshold and inactivity >= 0.6
        return {
            "fall_detected": post_fall_detected or label > 0,
            "class": classes[label],
            "probabilities": dict(zip(classes, probabilities.astype(float))),
            "impact_threshold": impact_threshold,
            "inactivity_score": inactivity,
        }
