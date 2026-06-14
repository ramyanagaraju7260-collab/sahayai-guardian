from __future__ import annotations

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from sahayai_x_ai.api.middleware import RequestTimingMiddleware, SimpleRateLimitMiddleware
from sahayai_x_ai.api.routes import agent, analytics, classification, emergency, prediction, vision, voice
from sahayai_x_ai.config import settings
from sahayai_x_ai.pipelines.realtime_pipeline import RealtimePipeline
from sahayai_x_ai.pipelines.training_pipeline import ensure_models_ready


app = FastAPI(title=settings.app_name, version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=[settings.cors_origin, "*"], allow_methods=["*"], allow_headers=["*"])
app.add_middleware(RequestTimingMiddleware)
app.add_middleware(SimpleRateLimitMiddleware)
app.include_router(emergency.router, prefix=settings.api_prefix)
app.include_router(classification.router, prefix=settings.api_prefix)
app.include_router(prediction.router, prefix=settings.api_prefix)
app.include_router(vision.router, prefix=settings.api_prefix)
app.include_router(voice.router, prefix=settings.api_prefix)
app.include_router(agent.router, prefix=settings.api_prefix)
app.include_router(analytics.router, prefix=settings.api_prefix)

realtime_pipeline = RealtimePipeline()


@app.on_event("startup")
def startup_event() -> None:
    ensure_models_ready()


@app.get("/api/health")
def health() -> dict[str, object]:
    return {"status": "ok", "service": settings.app_name}


@app.websocket("/ws/realtime/{user_id}")
async def realtime_socket(websocket: WebSocket, user_id: str) -> None:
    await websocket.accept()
    try:
        while True:
            payload = await websocket.receive_json()
            result = await realtime_pipeline.ingest(user_id, payload)
            if result is not None:
                await websocket.send_json(result)
    except WebSocketDisconnect:
        await websocket.close()


@app.exception_handler(Exception)
async def unhandled_exception_handler(_, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=500, content={"error": type(exc).__name__, "detail": str(exc)})
