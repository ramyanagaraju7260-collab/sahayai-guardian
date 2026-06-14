from __future__ import annotations

from sahayai_x_ai.models.sensor_fusion.fusion_engine import SensorFusionEngine


def main() -> None:
    engine = SensorFusionEngine()
    print(
        engine.fuse(
            {
                "accident_probability": 0.8,
                "fall_probability": 0.2,
                "fire_visual_score": 0.1,
                "voice_panic_score": 0.6,
                "nlp_emergency_intent": 0.9,
                "face_distress_score": 0.5,
                "location_risk_score": 0.4,
                "inactivity_duration": 30,
            },
            "Road Accident",
        )
    )


if __name__ == "__main__":
    main()

