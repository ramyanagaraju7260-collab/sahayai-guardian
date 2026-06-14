from __future__ import annotations

from sahayai_x_ai.utils.sms_gateway import send_sms


def trigger_contacts_alert(contacts: list[str], message: str) -> list[dict[str, str]]:
    return [send_sms(contact, message) for contact in contacts]

