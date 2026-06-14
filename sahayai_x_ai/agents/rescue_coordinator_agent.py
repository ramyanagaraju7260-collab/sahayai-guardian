from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class RescueCoordinatorAgent:
    def run(self, context: dict[str, object]) -> dict[str, object]:
        severity = float(context.get("severity_score", 50))
        emergency_type = str(context.get("emergency_type", "Road Accident"))
        hospitals = [
            {"name": "City Emergency Hospital", "distance_km": 3.4, "eta_minutes": 9, "specialty_match": 0.95},
            {"name": "Metro Trauma Center", "distance_km": 5.1, "eta_minutes": 13, "specialty_match": 0.91},
            {"name": "General Care Hospital", "distance_km": 6.7, "eta_minutes": 17, "specialty_match": 0.82},
        ]
        return {
            "hospitals": hospitals,
            "police_station_contact": "+910000000101" if emergency_type in {"Road Accident", "Violence/Assault"} else None,
            "fire_station_contact": "+910000000102" if emergency_type in {"Fire/Smoke", "Electrical Hazard"} else None,
            "resources_needed": ["helicopter"] if severity > 90 else ["ambulance"],
        }

