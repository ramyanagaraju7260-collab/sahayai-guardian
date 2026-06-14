from __future__ import annotations

from sahayai_x_ai.agents.emergency_orchestrator_agent import EmergencyOrchestratorAgent
from sahayai_x_ai.agents.emotional_support_agent import EmotionalSupportAgent


def test_orchestrator_returns_plan() -> None:
    result = EmergencyOrchestratorAgent().run({"user_id": "u1", "emergency_type": "Road Accident"})
    assert result["response_plan"]


def test_support_agent_returns_message() -> None:
    result = EmotionalSupportAgent().run({"distress_level": 8})
    assert "message" in result

