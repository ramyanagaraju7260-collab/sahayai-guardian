from __future__ import annotations

from pathlib import Path

import joblib
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.pipeline import Pipeline
    from sklearn.svm import LinearSVC

    SKLEARN_READY = True
except Exception:  # pragma: no cover
    TfidfVectorizer = Pipeline = LinearSVC = None
    SKLEARN_READY = False

from sahayai_x_ai.config import MODEL_CACHE_DIR
from sahayai_x_ai.models.nlp.distress_sentiment import DistressSentimentAnalyzer
from sahayai_x_ai.models.nlp.keyword_extractor import extract_keywords
from sahayai_x_ai.models.nlp.multilingual_processor import MultilingualEmergencyProcessor


class EmergencyNLPClassifier:
    def __init__(self, model_dir: Path | None = None) -> None:
        self.intent_path = (model_dir or MODEL_CACHE_DIR) / "nlp_intent.pkl"
        self.type_path = (model_dir or MODEL_CACHE_DIR) / "nlp_type.pkl"
        self.multilingual = MultilingualEmergencyProcessor()
        self.sentiment = DistressSentimentAnalyzer()
        self.ready = False

    def _training_corpus(self) -> tuple[list[str], list[str], list[str], list[str]]:
        emergency = [
            "help there is fire in my house",
            "car accident on highway with blood",
            "my father collapsed and cannot breathe",
            "someone attacked me please save me",
            "electric shock and smoke in office",
            "i fell and cannot get up",
        ]
        non_emergency = [
            "what is the weather today",
            "schedule my meeting tomorrow",
            "play music for me",
            "where is the nearest coffee shop",
        ]
        uncertain = [
            "i feel strange and dizzy",
            "there is a smell maybe burning",
            "not sure if this is serious",
        ]
        type_texts = emergency + [
            "massive flood in street",
            "building is on fire with smoke",
            "bike crash near bridge",
        ]
        type_labels = [
            "fire",
            "accident",
            "medical",
            "violence",
            "electrical",
            "fall",
            "flood",
            "fire",
            "accident",
        ]
        intent_texts = emergency + non_emergency + uncertain
        intent_labels = ["emergency"] * len(emergency) + ["non_emergency"] * len(non_emergency) + ["uncertain"] * len(uncertain)
        return intent_texts, intent_labels, type_texts, type_labels

    def train(self) -> None:
        intent_texts, intent_labels, type_texts, type_labels = self._training_corpus()
        if not SKLEARN_READY:
            joblib.dump({"mode": "keyword"}, self.intent_path)
            joblib.dump({"mode": "keyword"}, self.type_path)
            self.ready = True
            return
        intent_model = Pipeline([("tfidf", TfidfVectorizer(ngram_range=(1, 2))), ("clf", LinearSVC())])
        type_model = Pipeline([("tfidf", TfidfVectorizer(ngram_range=(1, 2))), ("clf", LinearSVC())])
        intent_model.fit(intent_texts, intent_labels)
        type_model.fit(type_texts, type_labels)
        joblib.dump(intent_model, self.intent_path)
        joblib.dump(type_model, self.type_path)
        self.ready = True

    def load(self) -> None:
        if not self.intent_path.exists() or not self.type_path.exists():
            self.train()
        self.intent_model = joblib.load(self.intent_path)
        self.type_model = joblib.load(self.type_path)
        self.ready = True

    def classify_text(self, text: str, target_language: str | None = None) -> dict[str, object]:
        if not self.ready:
            self.load()
        processed = self.multilingual.process(text, target_language)
        normalized = processed.normalized_text
        if isinstance(self.intent_model, dict) and self.intent_model.get("mode") == "keyword":
            keywords = extract_keywords(normalized)
            intent_label = "emergency" if any(k in normalized for k in ["help", "fire", "accident", "blood", "attack", "shock", "fall"]) else "non_emergency"
            emergency_type = next((k for k in ["accident", "fire", "medical", "violence", "flood", "electrical", "fall"] if k in normalized), "medical")
        else:
            intent_label = self.intent_model.predict([normalized])[0]
            emergency_type = self.type_model.predict([normalized])[0]
            keywords = extract_keywords(normalized)
        distress = self.sentiment.analyze(normalized)
        intent_score = {"emergency": 0.95, "uncertain": 0.55, "non_emergency": 0.05}[intent_label]
        return {
            "language": processed.language,
            "normalized_text": normalized,
            "intent_label": intent_label,
            "intent_score": intent_score,
            "emergency_type": emergency_type,
            "confidence": intent_score if intent_label == "emergency" else 1 - intent_score,
            "keywords": keywords,
            "distress": distress,
            "entities": self._extract_entities(normalized),
            "summary": self._summarize(normalized, emergency_type, distress["distress_level"]),
            "response_language": processed.translated_response_language,
        }

    @staticmethod
    def _extract_entities(text: str) -> dict[str, list[str]]:
        words = text.split()
        locations = [word for word in words if word in {"road", "highway", "office", "bridge", "street"}]
        injuries = [word for word in words if word in {"blood", "burn", "fracture", "pain", "stroke"}]
        names = [word.title() for word in words if word in {"john", "rahul", "priya", "anita"}]
        return {"locations": locations, "injuries": injuries, "person_names": names}

    @staticmethod
    def _summarize(text: str, emergency_type: str, distress_level: float) -> dict[str, object]:
        return {
            "type": emergency_type,
            "location": " ".join([token for token in text.split() if token in {"highway", "office", "street", "bridge"}]) or "unknown",
            "injuries": " ".join([token for token in text.split() if token in {"blood", "burn", "pain", "fracture"}]) or "unspecified",
            "urgency": "high" if distress_level >= 7 else "moderate" if distress_level >= 4 else "low",
        }
