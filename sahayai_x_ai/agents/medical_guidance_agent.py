from __future__ import annotations

from dataclasses import dataclass


GUIDANCE = {
    "Road Accident": [
        "Check responsiveness and breathing immediately.",
        "Apply firm pressure to visible bleeding with clean cloth.",
        "Keep the neck and spine still unless there is fire or direct danger.",
    ],
    "Fire/Smoke": [
        "Move the person to fresh air if it is safe to do so.",
        "Cool burns with clean running water for 20 minutes.",
        "Do not apply creams or break blisters.",
    ],
    "Medical Emergency": [
        "If no pulse and no breathing, begin CPR now.",
        "For stroke, note FAST signs and keep the person on their side if vomiting.",
        "Do not give food or drink if consciousness is altered.",
    ],
    "Fall Injury": [
        "Do not force the person to stand.",
        "Immobilize the injured area and watch for head injury symptoms.",
        "Call for urgent transport if pain is severe or confusion is present.",
    ],
}


@dataclass(slots=True)
class MedicalGuidanceAgent:
    def run(self, context: dict[str, object]) -> dict[str, object]:
        emergency_type = str(context.get("emergency_type", "Medical Emergency"))
        distress = int(context.get("distress_level", 5))
        guidance = GUIDANCE.get(emergency_type, GUIDANCE["Medical Emergency"])
        if distress >= 8:
            guidance = [step.split(".")[0] + "." for step in guidance]
        return {
            "tone": "calm",
            "steps": [f"{idx}. {step}" for idx, step in enumerate(guidance, start=1)],
            "critical_first": True,
        }

