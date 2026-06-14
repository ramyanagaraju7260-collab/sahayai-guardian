from __future__ import annotations

from collections import Counter

from fastapi import APIRouter

from sahayai_x_ai.pipelines.batch_analytics_pipeline import build_hotspots


router = APIRouter()


@router.get("/analytics/heatmap")
def analytics_heatmap() -> dict[str, object]:
    points = [(12.9716, 77.5946), (12.9720, 77.5950), (12.9800, 77.6010), (28.6139, 77.2090)]
    return build_hotspots(points)


@router.get("/analytics/stats")
def analytics_stats() -> dict[str, object]:
    classes = Counter(["Road Accident", "Road Accident", "Fire/Smoke", "Medical Emergency", "Fall Injury"])
    return {
        "hourly_prediction": [{"hour": hour, "expected_emergencies": round(1.2 + (hour % 5) * 0.4, 2)} for hour in range(24)],
        "counts": classes,
        "false_alarm_rate": 0.08,
        "top_patterns": {"peak_hour": 19, "peak_day": "Friday"},
    }

