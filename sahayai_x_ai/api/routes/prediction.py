from __future__ import annotations

from fastapi import APIRouter

from sahayai_x_ai.models.severity_predictor.model import SeverityPredictor
from sahayai_x_ai.schemas import SeverityPredictionRequest


router = APIRouter()
predictor = SeverityPredictor()


@router.post("/predict/severity")
def predict_severity(payload: SeverityPredictionRequest) -> dict[str, object]:
    return predictor.predict(payload.model_dump())

