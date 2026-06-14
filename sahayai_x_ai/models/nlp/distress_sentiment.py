from __future__ import annotations

try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

    VADER_READY = True
except Exception:  # pragma: no cover
    SentimentIntensityAnalyzer = None
    VADER_READY = False


class DistressSentimentAnalyzer:
    def __init__(self) -> None:
        self.analyzer = SentimentIntensityAnalyzer() if VADER_READY else None

    def analyze(self, text: str) -> dict[str, float]:
        if self.analyzer is None:
            negative = min(1.0, sum(word in text.lower() for word in ["help", "fire", "blood", "pain", "attack"]) / 4)
            scores = {"compound": -negative, "neg": negative}
        else:
            scores = self.analyzer.polarity_scores(text)
        urgency_keywords = sum(keyword in text.lower() for keyword in ["help", "fire", "blood", "pain", "save"])
        panic_markers = text.count("!") + text.lower().count("please")
        distress = min(10.0, abs(scores["neg"]) * 4 + urgency_keywords * 1.5 + panic_markers * 0.5)
        return {"sentiment": scores["compound"], "distress_level": round(distress, 2)}
