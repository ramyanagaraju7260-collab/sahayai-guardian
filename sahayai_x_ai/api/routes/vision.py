from __future__ import annotations

from fastapi import APIRouter

from sahayai_x_ai.models.computer_vision.blood_injury_detector import BloodInjuryDetector
from sahayai_x_ai.models.computer_vision.face_distress_analyzer import FaceDistressAnalyzer
from sahayai_x_ai.models.computer_vision.fire_smoke_detector import FireSmokeDetector
from sahayai_x_ai.schemas import VisionRequest


router = APIRouter()
fire_detector = FireSmokeDetector()
blood_detector = BloodInjuryDetector()
face_analyzer = FaceDistressAnalyzer()


@router.post("/vision/analyze")
def analyze_vision(payload: VisionRequest) -> dict[str, object]:
    fire = fire_detector.analyze(payload.image_base64)
    blood = blood_detector.analyze(payload.image_base64)
    face = face_analyzer.analyze(payload.image_base64)
    visual_score = max(
        fire["fire_confidence"],
        fire["smoke_confidence"],
        blood["scores"]["injury_visible"],
        blood["scores"]["blood_detected"],
        face["face_distress_score"],
    )
    return {
        **fire,
        **blood,
        **face,
        "overall_visual_danger_score": round(visual_score, 4),
        "emergency_recommended": visual_score >= 0.6,
    }

