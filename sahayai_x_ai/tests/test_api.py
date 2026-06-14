from __future__ import annotations

import asyncio
from datetime import datetime

import httpx

from sahayai_x_ai.api.main import app


def sample_window() -> list[list[float]]:
    return [[0.1, 0.2, 1.0, 0.01, 0.01, 0.01, 12.0] for _ in range(50)]


def test_health() -> None:
    async def run():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
            return await client.get("/api/health")

    response = asyncio.run(run())
    assert response.status_code == 200


def test_accident_endpoint() -> None:
    async def run():
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
            return await client.post(
                "/api/detect/accident",
                json={"sensor_window": sample_window(), "timestamp": datetime.utcnow().isoformat()},
            )

    response = asyncio.run(run())
    assert response.status_code == 200
