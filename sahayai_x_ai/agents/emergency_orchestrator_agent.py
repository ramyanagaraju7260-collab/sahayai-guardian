from __future__ import annotations

from dataclasses import dataclass

from sahayai_x_ai.utils.alert_system import trigger_contacts_alert


@dataclass(slots=True)
class EmergencyOrchestratorAgent:
    system_prompt: str = (
        "You are the SahayAI Emergency Orchestrator. Analyze the situation, determine "
        "the optimal response strategy, and execute tools in the right sequence."
    )

    def run(self, context: dict[str, object]) -> dict[str, object]:
        user_id = context.get("user_id", "unknown")
        contacts = self.get_emergency_contacts(user_id)
        medical_profile = self.get_medical_profile(user_id)
        lat = float(context.get("lat", 12.9716))
        lng = float(context.get("lng", 77.5946))
        emergency_type = str(context.get("emergency_type", "Road Accident"))
        hospital = self.get_nearest_hospital(lat, lng, emergency_type)
        alerts = trigger_contacts_alert(
            contacts, f"SahayAI detected {emergency_type}. Help is being coordinated near {lat:.4f},{lng:.4f}."
        )
        dispatch = self.dispatch_ambulance(hospital["hospital_id"], {"lat": lat, "lng": lng})
        return {
            "response_plan": [
                "Assess emergency type and severity",
                "Alert trusted contacts",
                "Select nearest specialty-matched hospital",
                "Dispatch ambulance when severity threshold is met",
            ],
            "medical_profile": medical_profile,
            "hospital": hospital,
            "alerts": alerts,
            "dispatch": dispatch,
        }

    @staticmethod
    def get_emergency_contacts(user_id: str) -> list[str]:
        return ["+911234567890", "+919876543210"]

    @staticmethod
    def get_medical_profile(user_id: str) -> dict[str, object]:
        return {"blood_group": "O+", "conditions": ["hypertension"]}

    @staticmethod
    def get_nearest_hospital(lat: float, lng: float, emergency_type: str) -> dict[str, object]:
        return {
            "hospital_id": "HSP-001",
            "name": "City Emergency Hospital",
            "distance_km": 3.4,
            "eta_minutes": 9,
            "specialty": emergency_type,
        }

    @staticmethod
    def get_danger_zone_info(lat: float, lng: float) -> dict[str, object]:
        return {"risk_score": 0.42, "zone": "urban arterial road"}

    @staticmethod
    def calculate_route(origin: tuple[float, float], destination: tuple[float, float]) -> dict[str, object]:
        return {"distance_km": 3.4, "eta_minutes": 9, "route": [origin, destination]}

    @staticmethod
    def dispatch_ambulance(hospital_id: str, user_location: dict[str, float]) -> dict[str, object]:
        return {"status": "dispatched", "hospital_id": hospital_id, "destination": user_location}

