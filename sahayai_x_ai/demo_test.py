from __future__ import annotations

import asyncio
import base64
import io
import json
import wave

import httpx
import numpy as np
from PIL import Image

from sahayai_x_ai.api.main import app


def make_image_base64() -> str:
    image = Image.new("RGB", (32, 32), color=(220, 60, 40))
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def make_audio_base64() -> str:
    sample_rate = 16000
    t = np.linspace(0, 1, sample_rate, endpoint=False)
    audio = (0.3 * np.sin(2 * np.pi * 440 * t) * 32767).astype(np.int16)
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(audio.tobytes())
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def sample_window() -> list[list[float]]:
    return [[0.1, 0.2, 1.0, 0.01, 0.01, 0.01, 12.0] for _ in range(50)]


async def run_demo() -> dict[str, object]:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        return {
            "health": (await client.get("/api/health")).json(),
            "accident": (await client.post("/api/detect/accident", json={"sensor_window": sample_window(), "timestamp": "2026-01-01T00:00:00"})).json(),
            "fall": (await client.post("/api/detect/fall", json={"sensor_window": sample_window(), "timestamp": "2026-01-01T00:00:00", "user_age": 68, "mode": "elderly"})).json(),
            "classify": (await client.post("/api/classify/emergency", json={"multimodal_features": [0.2] * 53})).json(),
            "severity": (
                await client.post(
                    "/api/predict/severity",
                    json={"emergency_type": "Road Accident", "peak_acceleration": 7.4, "heart_rate_deviation": 0.6, "anomaly_duration": 25, "user_age": 52, "location_risk_score": 0.7, "voice_panic_level": 0.8, "co_occurring_signals": 4},
                )
            ).json(),
            "vision": (await client.post("/api/vision/analyze", json={"image_base64": make_image_base64()})).json(),
            "voice": (await client.post("/api/voice/analyze", json={"audio_base64": make_audio_base64(), "transcript_hint": "help fire accident save me"})).json(),
            "nlp": (await client.post("/api/nlp/classify", json={"text": "help there is a fire on the highway"})).json(),
            "agent": (await client.post("/api/agent/orchestrate", json={"user_id": "u1", "context": {"emergency_type": "Road Accident"}})).json(),
            "analytics": (await client.get("/api/analytics/stats")).json(),
        }


def main() -> None:
    outputs = asyncio.run(run_demo())
    print(json.dumps(outputs, indent=2))


if __name__ == "__main__":
    main()
