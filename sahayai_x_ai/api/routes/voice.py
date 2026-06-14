from __future__ import annotations

from fastapi import APIRouter

from sahayai_x_ai.models.voice_panic_detector.model import VoicePanicDetector
from sahayai_x_ai.schemas import VoiceRequest


router = APIRouter()
detector = VoicePanicDetector()


@router.post("/voice/analyze")
def analyze_voice(payload: VoiceRequest) -> dict[str, object]:
    return detector.analyze(payload.audio_base64, payload.transcript_hint, payload.gender)

