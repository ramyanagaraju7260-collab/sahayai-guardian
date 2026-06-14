from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
try:
    from imblearn.over_sampling import SMOTE
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import classification_report
    from sklearn.model_selection import train_test_split
    from sklearn.neural_network import MLPClassifier
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler

    try:
        from lightgbm import LGBMClassifier
    except Exception:  # pragma: no cover
        from sklearn.ensemble import GradientBoostingClassifier as LGBMClassifier

    SKLEARN_READY = True
except Exception:  # pragma: no cover
    SMOTE = LogisticRegression = classification_report = train_test_split = MLPClassifier = Pipeline = StandardScaler = None
    LGBMClassifier = None
    SKLEARN_READY = False

from sahayai_x_ai.config import MODEL_CACHE_DIR
from sahayai_x_ai.data.synthetic.generate_accident_data import generate_accident_dataset
from sahayai_x_ai.models.accident_detector.preprocessor import extract_features, extract_sequence
from sahayai_x_ai.utils.logger import get_logger


logger = get_logger(__name__)


class AccidentDetector:
    def __init__(self, model_dir: Path | None = None) -> None:
        self.model_dir = model_dir or MODEL_CACHE_DIR
        self.meta_path = self.model_dir / "accident_detector.pkl"
        self.lstm_path = self.model_dir / "accident_lstm.h5"
        self.ready = False

    def train(self, samples: int = 4000) -> dict[str, Any]:
        windows, labels = generate_accident_dataset(samples=samples)
        sequence_features = np.asarray([extract_sequence(window.tolist()).reshape(-1) for window in windows])
        statistical_features = np.asarray([extract_features(window.tolist()) for window in windows])
        if not SKLEARN_READY:
            positive_scores = [
                float(np.max(np.linalg.norm(window[:, :3], axis=1)) + np.max(np.abs(np.gradient(window[:, 6]))))
                for window, label in zip(windows, labels)
                if label == 1
            ]
            negative_scores = [
                float(np.max(np.linalg.norm(window[:, :3], axis=1)) + np.max(np.abs(np.gradient(window[:, 6]))))
                for window, label in zip(windows, labels)
                if label == 0
            ]
            bundle = {
                "mode": "heuristic",
                "positive_mean": float(np.mean(positive_scores)),
                "negative_mean": float(np.mean(negative_scores)),
            }
            joblib.dump(bundle, self.meta_path)
            self.lstm_path.write_text(json.dumps({"model": "heuristic"}), encoding="utf-8")
            self.bundle = bundle
            self.ready = True
            return {"f1": 0.0, "accuracy": 0.0, "samples": samples, "fallback": True}

        x_seq_train, x_seq_test, y_train, y_test = train_test_split(
            sequence_features, labels, test_size=0.3, random_state=42, stratify=labels
        )
        x_feat_train, x_feat_test, _, _ = train_test_split(
            statistical_features, labels, test_size=0.3, random_state=42, stratify=labels
        )

        smote = SMOTE(random_state=42)
        x_seq_train, y_train_balanced = smote.fit_resample(x_seq_train, y_train)
        x_feat_train, _ = smote.fit_resample(x_feat_train, y_train)

        lstm_proxy = Pipeline(
            [
                ("scaler", StandardScaler()),
                ("mlp", MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=250, random_state=42)),
            ]
        )
        gbm = Pipeline(
            [
                ("scaler", StandardScaler()),
                ("clf", LGBMClassifier(random_state=42)),
            ]
        )
        lstm_proxy.fit(x_seq_train, y_train_balanced)
        gbm.fit(x_feat_train, y_train_balanced)

        seq_pred_train = lstm_proxy.predict_proba(x_seq_train)[:, 1]
        feat_pred_train = gbm.predict_proba(x_feat_train)[:, 1]
        meta_features = np.column_stack([seq_pred_train, feat_pred_train])
        meta_learner = LogisticRegression(random_state=42)
        meta_learner.fit(meta_features, y_train_balanced)

        joblib.dump(
            {
                "sequence_model": lstm_proxy,
                "feature_model": gbm,
                "meta_learner": meta_learner,
            },
            self.meta_path,
        )
        self.lstm_path.write_text(json.dumps({"model": "mlp_lstm_proxy", "shape": [50, 9]}), encoding="utf-8")
        test_pred = self._predict_from_arrays(x_seq_test, x_feat_test)
        report = classification_report(y_test, (test_pred >= 0.5).astype(int), output_dict=True)
        self.ready = True
        return {"f1": report["1"]["f1-score"], "accuracy": report["accuracy"], "samples": samples}

    def load(self) -> None:
        if not self.meta_path.exists():
            self.train()
        self.bundle = joblib.load(self.meta_path)
        self.ready = True

    def _predict_from_arrays(self, seq_array: np.ndarray, feat_array: np.ndarray) -> np.ndarray:
        if not getattr(self, "bundle", None):
            self.bundle = joblib.load(self.meta_path)
        if self.bundle.get("mode") == "heuristic":
            probabilities = []
            for row in np.asarray(seq_array, dtype=float):
                matrix = row.reshape(50, 9)
                max_acc = float(np.max(matrix[:, 7]))
                jerk = float(np.max(np.abs(matrix[:, 8])))
                raw = max_acc + jerk
                span = max(1e-6, self.bundle["positive_mean"] - self.bundle["negative_mean"])
                probabilities.append(float(np.clip((raw - self.bundle["negative_mean"]) / span, 0.0, 1.0)))
            return np.asarray(probabilities)
        seq_prob = self.bundle["sequence_model"].predict_proba(seq_array)[:, 1]
        feat_prob = self.bundle["feature_model"].predict_proba(feat_array)[:, 1]
        return self.bundle["meta_learner"].predict_proba(np.column_stack([seq_prob, feat_prob]))[:, 1]

    def predict(self, sensor_window: list[list[float]]) -> dict[str, Any]:
        if not self.ready:
            self.load()
        seq = extract_sequence(sensor_window).reshape(1, -1)
        feat = extract_features(sensor_window).reshape(1, -1)
        probability = float(self._predict_from_arrays(seq, feat)[0])
        severity = self._severity(probability)
        return {
            "accident_detected": probability >= 0.6,
            "probability": probability,
            "severity": severity,
            "confidence": round(abs(probability - 0.5) * 2, 4),
            "action": self._action_for_severity(severity),
        }

    @staticmethod
    def _severity(probability: float) -> str:
        if probability < 0.4:
            return "No accident"
        if probability < 0.6:
            return "Minor incident"
        if probability < 0.8:
            return "Moderate accident"
        if probability < 0.95:
            return "Severe accident"
        return "Critical"

    @staticmethod
    def _action_for_severity(severity: str) -> str:
        actions = {
            "No accident": "Monitor sensors",
            "Minor incident": "Check in with user",
            "Moderate accident": "Alert emergency contacts",
            "Severe accident": "Trigger SOS and ambulance recommendation",
            "Critical": "Immediate multi-agency escalation",
        }
        return actions[severity]
