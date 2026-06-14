from __future__ import annotations

from fastapi import APIRouter

from sahayai_x_ai.models.accident_detector.model import AccidentDetector
from sahayai_x_ai.models.fall_detector.model import FallDetector
from sahayai_x_ai.models.sensor_fusion.fusion_engine import SensorFusionEngine
from sahayai_x_ai.schemas import AccidentDetectionRequest, EmergencyDetectionRequest, FallDetectionRequest


router = APIRouter()
accident_detector = AccidentDetector()
fall_detector = FallDetector()
fusion_engine = SensorFusionEngine()


@router.post("/detect/accident")
def detect_accident(payload: AccidentDetectionRequest) -> dict[str, object]:
    return accident_detector.predict(payload.sensor_window)


@router.post("/detect/fall")
def detect_fall(payload: FallDetectionRequest) -> dict[str, object]:
    return fall_detector.predict(payload.sensor_window, payload.user_age, payload.mode)


@router.post("/detect/emergency")
def detect_emergency(payload: EmergencyDetectionRequest) -> dict[str, object]:
    return fusion_engine.fuse(payload.model_dump(), payload.emergency_type_hint)

