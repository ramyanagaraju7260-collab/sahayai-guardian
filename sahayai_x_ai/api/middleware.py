from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request
from starlette.middleware.base import BaseHTTPMiddleware

from sahayai_x_ai.config import settings
from sahayai_x_ai.utils.logger import get_logger


logger = get_logger(__name__)
RATE_BUCKETS: dict[str, deque] = defaultdict(deque)


class RequestTimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - start) * 1000
        response.headers["X-Process-Time-Ms"] = f"{elapsed_ms:.2f}"
        logger.info("%s %s -> %s in %.2fms", request.method, request.url.path, response.status_code, elapsed_ms)
        return response


class SimpleRateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client = request.client.host if request.client else "unknown"
        now = time.time()
        bucket = RATE_BUCKETS[client]
        while bucket and now - bucket[0] > 60:
            bucket.popleft()
        if len(bucket) >= settings.rate_limit_per_minute:
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        bucket.append(now)
        return await call_next(request)

