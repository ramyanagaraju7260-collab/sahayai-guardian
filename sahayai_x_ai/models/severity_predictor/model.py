from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
try:
    from sklearn.ensemble import GradientBoostingRegressor

    SKLEARN_READY = True
except Exception:  # pragma: no cover
    GradientBoostingRegressor = None
    SKLEARN_READY = False

from sahayai_x_ai.config import MODEL_CACHE_DIR


EMERGENCY_TYPES = [
    "No Emergency",
    "Road Accident",
    "Fire/Smoke",
    "Medical Emergency",
    "Fall Injury",
    "Violence/Assault",
    "Natural Disaster",
    "Electrical Hazard",
]


class SeverityPredictor:
    def __init__(self, model_dir: Path | None = None) -> None:
        self.model_path = (model_dir or MODEL_CACHE_DIR) / "severity_predictor.pkl"
        self.ready = False

    def _featurize(self, payload: dict[str, object]) -> np.ndarray:
        one_hot = [1.0 if payload["emergency_type"] == item else 0.0 for item in EMERGENCY_TYPES]
        conditions = len(payload.get("health_conditions", []))
        vector = one_hot + [
            float(payload.get("peak_acceleration", 1.0)),
            float(payload.get("heart_rate_deviation", 0.0)),
            float(payload.get("anomaly_duration", 0.0)),
            float(payload.get("user_age", 35)),
            float(conditions),
            float(payload.get("time_since_last_activity", 0.0)),
            float(payload.get("location_risk_score", 0.0)),
            float(payload.get("voice_panic_level", 0.0)),
            float(payload.get("co_occurring_signals", 0.0)),
        ]
        return np.asarray(vector, dtype=float)

    def train(self, samples: int = 5000) -> dict[str, float]:
        rng = np.random.default_rng(42)
        rows = []
        targets = []
        for _ in range(samples):
            payload = {
                "emergency_type": rng.choice(EMERGENCY_TYPES),
                "peak_acceleration": float(rng.uniform(0.8, 15.0)),
                "heart_rate_deviation": float(rng.uniform(0.0, 1.0)),
                "anomaly_duration": float(rng.uniform(0.0, 300.0)),
                "user_age": int(rng.integers(18, 85)),
                "health_conditions": ["condition"] * int(rng.integers(0, 4)),
                "time_since_last_activity": float(rng.uniform(0.0, 720.0)),
                "location_risk_score": float(rng.uniform(0.0, 1.0)),
                "voice_panic_level": float(rng.uniform(0.0, 1.0)),
                "co_occurring_signals": int(rng.integers(0, 6)),
            }
            rows.append(self._featurize(payload))
            severity = (
                payload["peak_acceleration"] * 4
                + payload["heart_rate_deviation"] * 12
                + payload["location_risk_score"] * 10
                + payload["voice_panic_level"] * 10
                + payload["co_occurring_signals"] * 5
                + len(payload["health_conditions"]) * 4
            )
            if payload["emergency_type"] != "No Emergency":
                severity += 15
            targets.append(min(100.0, severity))
        if not SKLEARN_READY:
            bundle = {"mode": "linear_rules", "baseline": float(np.mean(targets))}
            joblib.dump(bundle, self.model_path)
            self.bundle = bundle
            self.ready = True
            return {"samples": samples, "fallback": True}
        model = GradientBoostingRegressor(random_state=42)
        model.fit(np.asarray(rows), np.asarray(targets))
        joblib.dump(model, self.model_path)
        self.bundle = model
        self.ready = True
        return {"samples": samples}

    def load(self) -> None:
        if not self.model_path.exists():
            self.train()
        self.bundle = joblib.load(self.model_path)
        self.ready = True

    def predict(self, payload: dict[str, object]) -> dict[str, object]:
        if not self.ready:
            self.load()
        if isinstance(self.bundle, dict) and self.bundle.get("mode") == "linear_rules":
            features = self._featurize(payload)
            score = float(
                np.clip(
                    self.bundle["baseline"]
                    + features[-8] * 3
                    + features[-7] * 15
                    + features[-4] * 8
                    + features[-3] * 10
                    + features[-2] * 12
                    + features[-1] * 6,
                    0.0,
                    100.0,
                )
            )
        else:
            score = float(np.clip(self.bundle.predict(self._featurize(payload).reshape(1, -1))[0], 0.0, 100.0))
        urgency = self._urgency(score)
        return {
            "severity_score": round(score, 2),
            "urgency_level": urgency,
            "recommended_response": self._recommended_response(urgency, payload["emergency_type"]),
            "estimated_time_to_critical_minutes": max(0, int((100 - score) * 1.4)),
            "resource_requirements": self._resources(urgency, payload["emergency_type"]),
        }

    @staticmethod
    def _urgency(score: float) -> str:
        if score < 30:
            return "Precautionary"
        if score < 60:
            return "Low"
        if score < 75:
            return "Moderate"
        if score < 90:
            return "High"
        return "Critical"

    @staticmethod
    def _recommended_response(urgency: str, emergency_type: str) -> str:
        return {
            "Precautionary": f"Monitor {emergency_type} indicators and continue observation",
            "Low": "Alert emergency contacts and keep user under watch",
            "Moderate": "Auto-alert contacts and recommend nearby hospital evaluation",
            "High": "Trigger SOS and prepare ambulance dispatch",
            "Critical": "Immediate multi-agency response required",
        }[urgency]

    @staticmethod
    def _resources(urgency: str, emergency_type: str) -> list[str]:
        resources = ["caregiver"]
        if urgency in {"Moderate", "High", "Critical"}:
            resources.append("ambulance")
        if emergency_type in {"Road Accident", "Violence/Assault"}:
            resources.append("police")
        if emergency_type in {"Fire/Smoke", "Electrical Hazard"}:
            resources.append("fire")
        return resources
