from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class EmotionalSupportAgent:
    def run(self, context: dict[str, object]) -> dict[str, object]:
        distress = float(context.get("distress_level", 5))
        if distress <= 3:
            message = "Stay with me. Help is being arranged. Take one slow breath in and out."
        elif distress <= 6:
            message = "Breathe in for four, hold for four, breathe out for four. Focus on my words."
        elif distress <= 8:
            message = "Look at me. Breathe. Stay still if you can. Help is coming."
        else:
            message = "Breathe. Stay awake. Answer yes or no. Help coming."
        return {"message": message, "check_in": "Are you still with me?"}

