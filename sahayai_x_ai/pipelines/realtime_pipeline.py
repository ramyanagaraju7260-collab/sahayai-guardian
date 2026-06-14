from __future__ import annotations

import asyncio
from collections import defaultdict, deque
from dataclasses import dataclass, field

import numpy as np

from sahayai_x_ai.agents.emergency_orchestrator_agent import EmergencyOrchestratorAgent
from sahayai_x_ai.models.accident_detector.model import AccidentDetector
from sahayai_x_ai.models.emergency_classifier.model import EmergencyClassifier
from sahayai_x_ai.models.fall_detector.model import FallDetector
from sahayai_x_ai.models.nlp.emergency_nlp_classifier import EmergencyNLPClassifier
from sahayai_x_ai.models.sensor_fusion.fusion_engine import SensorFusionEngine
from sahayai_x_ai.models.severity_predictor.model import SeverityPredictor


@dataclass(slots=True)
class RealtimePipeline:
    accident_detector: AccidentDetector = field(default_factory=AccidentDetector)
    fall_detector: FallDetector = field(default_factory=FallDetector)
    emergency_classifier: EmergencyClassifier = field(default_factory=EmergencyClassifier)
    nlp_classifier: EmergencyNLPClassifier = field(default_factory=EmergencyNLPClassifier)
    severity_predictor: SeverityPredictor = field(default_factory=SeverityPredictor)
    fusion_engine: SensorFusionEngine = field(default_factory=SensorFusionEngine)
    orchestrator: EmergencyOrchestratorAgent = field(default_factory=EmergencyOrchestratorAgent)
    buffers: dict[str, deque] = field(default_factory=lambda: defaultdict(lambda: deque(maxlen=50)))

    async def ingest(self, user_id: str, payload: dict[str, object]) -> dict[str, object] | None:
        sensor = payload.get("sensor", {})
        sample = [
            float(sensor.get("acc_x", 0.0)),
            float(sensor.get("acc_y", 0.0)),
            float(sensor.get("acc_z", 1.0)),
            float(sensor.get("gyro_x", 0.0)),
            float(sensor.get("gyro_y", 0.0)),
            float(sensor.get("gyro_z", 0.0)),
            float(sensor.get("speed", 0.0)),
        ]
        self.buffers[user_id].append(sample)
        if len(self.buffers[user_id]) < 50:
            return None
        window = list(self.buffers[user_id])
        return await self.run_window(user_id, window, payload)

    async def run_window(self, user_id: str, window: list[list[float]], payload: dict[str, object]) -> dict[str, object]:
        async def with_timeout(func, *args):
            return await asyncio.wait_for(asyncio.to_thread(func, *args), timeout=0.2)

        accident_task = with_timeout(self.accident_detector.predict, window)
        fall_task = with_timeout(self.fall_detector.predict, window, int(payload.get("user_age", 35)), str(payload.get("mode", "default")))
        results = await asyncio.gather(accident_task, fall_task, return_exceptions=True)
        accident_result = results[0] if isinstance(results[0], dict) else {"probability": 0.0, "severity": "unknown"}
        fall_result = results[1] if isinstance(results[1], dict) else {"probabilities": {"normal": 1.0}, "class": "normal"}
        nlp_text = str(payload.get("voice_text", ""))
        nlp_result = self.nlp_classifier.classify_text(nlp_text) if nlp_text else {"intent_score": 0.0, "emergency_type": "No Emergency"}
        feature_vector = self._build_feature_vector(accident_result, fall_result, payload)
        class_result = self.emergency_classifier.predict(feature_vector)
        fused = self.fusion_engine.fuse(
            {
                "accident_probability": float(accident_result.get("probability", 0.0)),
                "fall_probability": float(fall_result.get("probabilities", {}).get("fall_severe", 0.0)),
                "fire_visual_score": float(payload.get("fire_visual_score", 0.0)),
                "voice_panic_score": float(payload.get("voice_panic_score", 0.0)),
                "nlp_emergency_intent": float(nlp_result.get("intent_score", 0.0)),
                "face_distress_score": float(payload.get("face_distress_score", 0.0)),
                "location_risk_score": float(payload.get("location_risk_score", 0.0)),
                "inactivity_duration": float(payload.get("inactivity_duration", 0.0)),
                "heart_rate_anomaly": float(payload.get("heart_rate_anomaly", 0.0)),
            },
            emergency_type_hint=class_result["emergency_type"],
        )
        severity = self.severity_predictor.predict(
            {
                "emergency_type": class_result["emergency_type"],
                "peak_acceleration": float(np.max(np.linalg.norm(np.asarray(window)[:, :3], axis=1))),
                "heart_rate_deviation": float(payload.get("heart_rate_anomaly", 0.0)),
                "anomaly_duration": float(payload.get("inactivity_duration", 0.0)),
                "user_age": int(payload.get("user_age", 35)),
                "health_conditions": payload.get("health_conditions", []),
                "time_since_last_activity": float(payload.get("time_since_last_activity", 0.0)),
                "location_risk_score": float(payload.get("location_risk_score", 0.0)),
                "voice_panic_level": float(payload.get("voice_panic_score", 0.0)),
                "co_occurring_signals": int(sum(v > 0.55 for v in [fused["emergency_probability"], nlp_result.get("intent_score", 0.0)])),
            }
        )
        response = {"user_id": user_id, "accident": accident_result, "fall": fall_result, "classification": class_result, "fusion": fused, "severity": severity}
        if fused["emergency_detected"]:
            response["orchestration"] = self.orchestrator.run(
                {
                    "user_id": user_id,
                    "emergency_type": class_result["emergency_type"],
                    "severity_score": severity["severity_score"],
                    "lat": float(payload.get("location", {}).get("lat", 12.9716)) if isinstance(payload.get("location"), dict) else 12.9716,
                    "lng": float(payload.get("location", {}).get("lng", 77.5946)) if isinstance(payload.get("location"), dict) else 77.5946,
                }
            )
        return response

    @staticmethod
    def _build_feature_vector(accident_result: dict[str, object], fall_result: dict[str, object], payload: dict[str, object]) -> list[float]:
        vector = [
            float(accident_result.get("probability", 0.0)),
            float(fall_result.get("probabilities", {}).get("fall_minor", 0.0)),
            float(fall_result.get("probabilities", {}).get("fall_severe", 0.0)),
            float(payload.get("fire_visual_score", 0.0)),
            float(payload.get("voice_panic_score", 0.0)),
        ]
        while len(vector) < 53:
            vector.append(float((len(vector) % 7) / 10))
        return vector[:53]

