from __future__ import annotations

from dataclasses import dataclass

try:
    from langdetect import detect

    LANGDETECT_READY = True
except Exception:  # pragma: no cover
    detect = None
    LANGDETECT_READY = False


TRANSLATION_HINTS = {
    "madad": "help",
    "aag": "fire",
    "durghatna": "accident",
    "bachao": "save me",
    "viluntu": "fall",
    "praanam": "life danger",
}


@dataclass(slots=True)
class ProcessedText:
    language: str
    normalized_text: str
    translated_response_language: str


class MultilingualEmergencyProcessor:
    def process(self, text: str, target_language: str | None = None) -> ProcessedText:
        language = detect(text) if LANGDETECT_READY and text.strip() else "en"
        normalized = text.lower()
        for source, target in TRANSLATION_HINTS.items():
            normalized = normalized.replace(source, target)
        return ProcessedText(
            language=language,
            normalized_text=normalized,
            translated_response_language=target_language or language,
        )
