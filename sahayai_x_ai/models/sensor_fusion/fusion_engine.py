from __future__ import annotations

from dataclasses import dataclass, field

from sahayai_x_ai.models.sensor_fusion.anomaly_detector import detect_signal_anomaly
from sahayai_x_ai.models.sensor_fusion.kalman_filter import EmergencyKalmanFilter


@dataclass(slots=True)
class SensorFusionEngine:
    weights: dict[str, float] = field(
        default_factory=lambda: {
            "accident": 0.25,
            "fall": 0.20,
            "fire": 0.15,
            "voice": 0.15,
            "nlp": 0.10,
            "face": 0.08,
            "location": 0.04,
            "inactivity": 0.03,
        }
    )
    kalman: EmergencyKalmanFilter = field(default_factory=EmergencyKalmanFilter)

    def weighted_average(self, inputs: dict[str, float]) -> float:
        return sum(inputs[key] * self.weights[key] for key in self.weights)

    @staticmethod
    def bayesian_fusion(inputs: dict[str, float], prior: float = 0.02) -> float:
        posterior = prior
        for value in inputs.values():
            likelihood = max(0.001, min(0.999, value))
            posterior = (likelihood * posterior) / ((likelihood * posterior) + ((1 - likelihood) * (1 - posterior)))
        return max(0.0, min(1.0, posterior))

    def fuse(self, payload: dict[str, float], emergency_type_hint: str = "No Emergency") -> dict[str, object]:
        inputs = {
            "accident": payload.get("accident_probability", 0.0),
            "fall": payload.get("fall_probability", 0.0),
            "fire": payload.get("fire_visual_score", 0.0),
            "voice": payload.get("voice_panic_score", 0.0),
            "nlp": payload.get("nlp_emergency_intent", 0.0),
            "face": payload.get("face_distress_score", 0.0),
            "location": payload.get("location_risk_score", 0.0),
            "inactivity": min(1.0, payload.get("inactivity_duration", 0.0) / 120.0),
        }
        weighted = self.weighted_average(inputs)
        bayesian = self.bayesian_fusion(inputs)
        raw_score = (weighted * 0.55) + (bayesian * 0.45)
        smoothed = self.kalman.update(raw_score)
        severity_score = int(round(smoothed * 100))
        urgency = (
            "Critical"
            if severity_score >= 90
            else "High"
            if severity_score >= 75
            else "Moderate"
            if severity_score >= 60
            else "Low"
            if severity_score >= 30
            else "Precautionary"
        )
        false_alarm_probability = max(0.0, 1.0 - smoothed - detect_signal_anomaly(inputs) * 0.2)
        return {
            "emergency_probability": round(smoothed, 4),
            "emergency_detected": smoothed >= 0.55,
            "primary_emergency_type": emergency_type_hint,
            "severity_score": severity_score,
            "urgency_level": urgency,
            "confidence": round(min(1.0, abs(smoothed - 0.5) * 2 + 0.1), 4),
            "contributing_signals": [
                {"sensor": key, "score": round(value, 4), "weight": self.weights[key]} for key, value in inputs.items()
            ],
            "false_alarm_probability": round(false_alarm_probability, 4),
            "recommended_action": "Trigger SOS" if severity_score >= 75 else "Continue guided monitoring",
            "auto_sos_trigger": severity_score >= 75,
        }
