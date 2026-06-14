from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, conlist


SensorSample = conlist(float, min_length=7, max_length=7)
SensorWindow = conlist(SensorSample, min_length=50, max_length=50)


class AccidentDetectionRequest(BaseModel):
    sensor_window: SensorWindow
    timestamp: datetime


class FallDetectionRequest(BaseModel):
    sensor_window: SensorWindow
    timestamp: datetime
    user_age: int = 35
    mode: str = "default"


class EmergencyClassificationRequest(BaseModel):
    multimodal_features: conlist(float, min_length=53, max_length=53)


class SeverityPredictionRequest(BaseModel):
    emergency_type: str
    peak_acceleration: float = 1.0
    heart_rate_deviation: float = 0.0
    anomaly_duration: float = 0.0
    user_age: int = 35
    health_conditions: list[str] = Field(default_factory=list)
    time_since_last_activity: float = 0.0
    location_risk_score: float = 0.0
    voice_panic_level: float = 0.0
    co_occurring_signals: int = 0


class VisionRequest(BaseModel):
    image_base64: str


class VoiceRequest(BaseModel):
    audio_base64: str
    transcript_hint: str | None = None
    gender: str = "unknown"


class NLPRequest(BaseModel):
    text: str
    target_language: str | None = None


class AgentRequest(BaseModel):
    user_id: str
    context: dict[str, Any]


class EmergencyDetectionRequest(BaseModel):
    accident_probability: float = 0.0
    fall_probability: float = 0.0
    fire_visual_score: float = 0.0
    voice_panic_score: float = 0.0
    nlp_emergency_intent: float = 0.0
    face_distress_score: float = 0.0
    location_risk_score: float = 0.0
    inactivity_duration: float = 0.0
    heart_rate_anomaly: float = 0.0
    emergency_type_hint: str = "No Emergency"


class RealtimeMessage(BaseModel):
    timestamp: datetime
    sensor: dict[str, float]
    location: dict[str, float] | None = None
    voice_text: str | None = None

