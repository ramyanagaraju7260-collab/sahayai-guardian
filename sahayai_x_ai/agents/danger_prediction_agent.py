from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class DangerPredictionAgent:
    def run(self, context: dict[str, object]) -> dict[str, object]:
        time_risk = float(context.get("time_risk", 0.3))
        location_risk = float(context.get("location_risk_score", 0.4))
        behavior_risk = float(context.get("behavior_risk", 0.2))
        route_risk = float(context.get("route_risk", 0.3))
        score = min(100.0, (time_risk * 25) + (location_risk * 35) + (behavior_risk * 20) + (route_risk * 20))
        return {
            "risk_score": round(score, 2),
            "warning": score >= 70,
            "factors": {
                "time": time_risk,
                "location": location_risk,
                "behavior": behavior_risk,
                "route": route_risk,
            },
        }

