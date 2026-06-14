from __future__ import annotations

from fastapi import APIRouter

from sahayai_x_ai.agents.emergency_orchestrator_agent import EmergencyOrchestratorAgent
from sahayai_x_ai.agents.emotional_support_agent import EmotionalSupportAgent
from sahayai_x_ai.agents.medical_guidance_agent import MedicalGuidanceAgent
from sahayai_x_ai.schemas import AgentRequest


router = APIRouter()
orchestrator = EmergencyOrchestratorAgent()
guidance_agent = MedicalGuidanceAgent()
support_agent = EmotionalSupportAgent()


@router.post("/agent/orchestrate")
def orchestrate(payload: AgentRequest) -> dict[str, object]:
    context = {"user_id": payload.user_id, **payload.context}
    return orchestrator.run(context)


@router.post("/agent/guidance")
def guidance(payload: AgentRequest) -> dict[str, object]:
    return guidance_agent.run(payload.context)


@router.post("/agent/support")
def support(payload: AgentRequest) -> dict[str, object]:
    return support_agent.run(payload.context)

