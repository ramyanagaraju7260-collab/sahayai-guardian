from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass


@dataclass(slots=True)
class EvidenceCollectionAgent:
    def run(self, context: dict[str, object]) -> dict[str, object]:
        serialized = json.dumps(context, sort_keys=True, default=str)
        digest = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
        return {
            "incident_report": context,
            "narrative_summary": f"Structured incident captured for {context.get('emergency_type', 'event')}.",
            "chain_of_custody_log": [{"event": "capture", "hash": digest}],
            "insurance_ready_report": True,
            "police_complaint_draft": "Automated draft prepared in English.",
        }

