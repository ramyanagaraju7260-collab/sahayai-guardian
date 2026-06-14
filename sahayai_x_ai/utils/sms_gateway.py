from __future__ import annotations

from sahayai_x_ai.utils.logger import get_logger


logger = get_logger(__name__)


def send_sms(phone_number: str, message: str) -> dict[str, str]:
    logger.info("Simulated SMS to %s: %s", phone_number, message)
    return {"status": "queued", "phone_number": phone_number, "message": message}

