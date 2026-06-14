from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
try:
    from sklearn.ensemble import RandomForestClassifier, VotingClassifier
    from sklearn.metrics import classification_report
    from sklearn.model_selection import train_test_split
    from sklearn.neural_network import MLPClassifier
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler

    SKLEARN_READY = True
except Exception:  # pragma: no cover
    RandomForestClassifier = VotingClassifier = classification_report = train_test_split = MLPClassifier = Pipeline = StandardScaler = None
    SKLEARN_READY = False

from sahayai_x_ai.config import MODEL_CACHE_DIR
from sahayai_x_ai.data.synthetic.generate_emergency_data import generate_emergency_feature_dataset
from sahayai_x_ai.models.emergency_classifier.label_encoder import EMERGENCY_CLASSES

try:
    from xgboost import XGBClassifier

    def make_xgb_classifier() -> object:
        return XGBClassifier(
            n_estimators=80,
            max_depth=4,
            learning_rate=0.1,
            subsample=0.9,
            objective="multi:softprob",
            num_class=8,
            eval_metric="mlogloss",
            random_state=42,
        )
except Exception:  # pragma: no cover
    from sklearn.ensemble import GradientBoostingClassifier

    def make_xgb_classifier() -> object:
        return GradientBoostingClassifier(random_state=42)


class EmergencyClassifier:
    def __init__(self, model_dir: Path | None = None) -> None:
        self.model_path = (model_dir or MODEL_CACHE_DIR) / "emergency_classifier.pkl"
        self.ready = False

    def train(self, samples: int = 5000) -> dict[str, float]:
        features, labels = generate_emergency_feature_dataset(samples=samples)
        if not SKLEARN_READY:
            centroids = {label: features[labels == label].mean(axis=0) for label in range(8)}
            bundle = {"mode": "centroid", "centroids": centroids}
            joblib.dump(bundle, self.model_path)
            self.bundle = bundle
            self.ready = True
            return {"accuracy": 0.0, "macro_f1": 0.0}
        x_train, x_test, y_train, y_test = train_test_split(
            features, labels, test_size=0.25, random_state=42, stratify=labels
        )
        xgb = make_xgb_classifier()
        rf = RandomForestClassifier(n_estimators=150, random_state=42)
        nn = Pipeline(
            [
                ("scaler", StandardScaler()),
                ("nn", MLPClassifier(hidden_layer_sizes=(128, 64, 32), max_iter=300, random_state=42)),
            ]
        )
        ensemble = VotingClassifier(
            estimators=[("xgb", xgb), ("rf", rf), ("nn", nn)],
            voting="soft",
            weights=[0.4, 0.2, 0.4],
        )
        ensemble.fit(x_train, y_train)
        joblib.dump(ensemble, self.model_path)
        self.bundle = ensemble
        self.ready = True
        report = classification_report(y_test, ensemble.predict(x_test), output_dict=True)
        return {"accuracy": report["accuracy"], "macro_f1": report["macro avg"]["f1-score"]}

    def load(self) -> None:
        if not self.model_path.exists():
            self.train()
        self.bundle = joblib.load(self.model_path)
        self.ready = True

    def predict(self, features: list[float]) -> dict[str, object]:
        if not self.ready:
            self.load()
        vector = np.asarray(features, dtype=float).reshape(1, -1)
        if isinstance(self.bundle, dict) and self.bundle.get("mode") == "centroid":
            distances = np.asarray(
                [np.linalg.norm(vector[0] - centroid) for centroid in self.bundle["centroids"].values()],
                dtype=float,
            )
            closeness = 1 / (distances + 1e-6)
            probabilities = closeness / np.sum(closeness)
        else:
            probabilities = self.bundle.predict_proba(vector)[0]
        label = int(np.argmax(probabilities))
        return {
            "emergency_type": EMERGENCY_CLASSES[label],
            "confidence": float(probabilities[label]),
            "probabilities": {EMERGENCY_CLASSES[i]: float(prob) for i, prob in enumerate(probabilities)},
        }
