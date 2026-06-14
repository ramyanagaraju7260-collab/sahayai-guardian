from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler

    SKLEARN_READY = True
except Exception:  # pragma: no cover
    RandomForestClassifier = Pipeline = StandardScaler = None
    SKLEARN_READY = False

from sahayai_x_ai.config import MODEL_CACHE_DIR
from sahayai_x_ai.data.synthetic.generate_voice_data import generate_voice_feature_dataset
from sahayai_x_ai.models.nlp.emergency_nlp_classifier import EmergencyNLPClassifier
from sahayai_x_ai.models.voice_panic_detector.feature_extractor import decode_pcm_wave, extract_voice_features


VOICE_KEYWORDS = {
    "en": ["help", "fire", "accident", "save me", "emergency", "hurt", "pain"],
    "hi": ["bachao", "madad", "aag", "durghatna", "help karo"],
    "kn": ["sahaya", "bega banni", "agni", "avaghadha"],
    "ta": ["udavi", "theeyai", "viluntu"],
    "te": ["sahayam", "agni", "praanam"],
}


class VoicePanicDetector:
    def __init__(self, model_dir: Path | None = None) -> None:
        self.model_path = (model_dir or MODEL_CACHE_DIR) / "voice_panic_detector.pkl"
        self.ready = False
        self.nlp = EmergencyNLPClassifier(model_dir)

    def train(self, samples: int = 2000) -> dict[str, int]:
        features, labels = generate_voice_feature_dataset(samples=samples)
        if not SKLEARN_READY:
            bundle = {
                "mode": "heuristic",
                "panic_rms": float(np.percentile(features[:, 128], 75)),
                "panic_pitch": float(np.percentile(features[:, 129], 75)),
            }
            joblib.dump(bundle, self.model_path)
            self.bundle = bundle
            self.ready = True
            return {"samples": samples}
        pipeline = Pipeline(
            [
                ("scaler", StandardScaler()),
                ("clf", RandomForestClassifier(n_estimators=150, random_state=42)),
            ]
        )
        pipeline.fit(features, labels)
        joblib.dump(pipeline, self.model_path)
        self.bundle = pipeline
        self.ready = True
        return {"samples": samples}

    def load(self) -> None:
        if not self.model_path.exists():
            self.train()
        self.bundle = joblib.load(self.model_path)
        self.ready = True

    def _keyword_hits(self, transcript: str) -> dict[str, list[str]]:
        lowered = transcript.lower()
        hits: dict[str, list[str]] = {}
        for lang, words in VOICE_KEYWORDS.items():
            found = [word for word in words if word in lowered]
            if found:
                hits[lang] = found
        return hits

    def analyze(self, audio_base64: str, transcript_hint: str | None = None, gender: str = "unknown") -> dict[str, object]:
        if not self.ready:
            self.load()
        audio, sample_rate = decode_pcm_wave(audio_base64)
        features = extract_voice_features(audio, sample_rate)
        if isinstance(self.bundle, dict) and self.bundle.get("mode") == "heuristic":
            panic_score_raw = 0.6 * float(features[128] >= self.bundle["panic_rms"]) + 0.4 * float(features[129] >= self.bundle["panic_pitch"])
            probabilities = np.asarray([max(0.05, 1 - panic_score_raw), 0.2 + panic_score_raw * 0.2, max(0.05, panic_score_raw)])
            probabilities = probabilities / probabilities.sum()
            label = int(np.argmax(probabilities))
        else:
            probabilities = self.bundle.predict_proba(features.reshape(1, -1))[0]
            label = int(np.argmax(probabilities))
        classes = ["calm", "distress", "panic"]
        transcript = transcript_hint or ""
        keyword_hits = self._keyword_hits(transcript)
        nlp_result = self.nlp.classify_text(transcript) if transcript else {"intent_score": 0.0}
        pitch = float(features[129])
        rms = float(features[128])
        pitch_trigger = pitch > (400 if gender == "female" else 300)
        score = float(
            min(
                1.0,
                probabilities[2] * 0.5
                + nlp_result.get("intent_score", 0.0) * 0.25
                + float(bool(keyword_hits)) * 0.15
                + float(pitch_trigger) * 0.1,
            )
        )
        return {
            "voice_state": classes[label],
            "panic_score": score,
            "class_probabilities": dict(zip(classes, probabilities.astype(float))),
            "keyword_hits": keyword_hits,
            "pitch_hz_estimate": pitch,
            "rms_energy": rms,
            "transcript": transcript,
            "emergency_intent_score": nlp_result.get("intent_score", 0.0),
        }
