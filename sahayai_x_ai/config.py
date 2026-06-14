from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
MODEL_CACHE_DIR = Path(os.getenv("MODEL_CACHE_DIR", BASE_DIR / "model_cache")).resolve()
MODEL_CACHE_DIR.mkdir(parents=True, exist_ok=True)


@dataclass(slots=True)
class Settings:
    app_name: str = "SahayAI X Backend"
    api_prefix: str = "/api"
    cors_origin: str = os.getenv("CORS_ORIGIN", "http://localhost:3000")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    mongodb_uri: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/sahayai")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    google_maps_api_key: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    sms_gateway_api_key: str = os.getenv("SMS_GATEWAY_API_KEY", "")
    sms_gateway_url: str = os.getenv(
        "SMS_GATEWAY_URL", "https://api.smsgatewayhub.com/api/mt/SendSMS"
    )
    app_secret_key: str = os.getenv("APP_SECRET_KEY", "change_this_in_production")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    max_workers: int = int(os.getenv("MAX_WORKERS", "4"))
    enable_gpu: bool = os.getenv("ENABLE_GPU", "false").lower() == "true"
    rate_limit_per_minute: int = 100


settings = Settings()

