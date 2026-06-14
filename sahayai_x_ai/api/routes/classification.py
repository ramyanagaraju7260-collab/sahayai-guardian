from __future__ import annotations

from fastapi import APIRouter

from sahayai_x_ai.models.emergency_classifier.model import EmergencyClassifier
from sahayai_x_ai.models.nlp.emergency_nlp_classifier import EmergencyNLPClassifier
from sahayai_x_ai.schemas import EmergencyClassificationRequest, NLPRequest


router = APIRouter()
classifier = EmergencyClassifier()
nlp_classifier = EmergencyNLPClassifier()


@router.post("/classify/emergency")
def classify_emergency(payload: EmergencyClassificationRequest) -> dict[str, object]:
    return classifier.predict(payload.multimodal_features)


@router.post("/nlp/classify")
def classify_nlp(payload: NLPRequest) -> dict[str, object]:
    return nlp_classifier.classify_text(payload.text, payload.target_language)

