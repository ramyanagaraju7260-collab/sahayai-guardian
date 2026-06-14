from __future__ import annotations

import base64
import io
import wave

import numpy as np


def decode_pcm_wave(audio_base64: str) -> tuple[np.ndarray, int]:
    raw = base64.b64decode(audio_base64)
    with wave.open(io.BytesIO(raw), "rb") as wav:
        frames = wav.readframes(wav.getnframes())
        audio = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0
        return audio, wav.getframerate()


def extract_voice_features(audio: np.ndarray, sample_rate: int) -> np.ndarray:
    if audio.size == 0:
        return np.zeros(140, dtype=float)
    frame = audio[: min(len(audio), sample_rate * 2)]
    spectrum = np.abs(np.fft.rfft(frame, n=256))
    rms = np.sqrt(np.mean(frame**2))
    zcr = np.mean(np.abs(np.diff(np.sign(frame)))) / 2
    centroid = float(np.sum(np.arange(len(spectrum)) * spectrum) / (np.sum(spectrum) + 1e-6))
    rolloff = float(np.searchsorted(np.cumsum(spectrum), 0.85 * np.sum(spectrum)))
    bandwidth = float(np.std(spectrum))
    features = np.zeros(140, dtype=float)
    features[:80] = np.resize(spectrum, 80)
    features[80:92] = np.resize(np.abs(np.diff(spectrum)), 12)
    features[92:124] = np.resize(spectrum / (np.max(spectrum) + 1e-6), 32)
    features[124:129] = [centroid, bandwidth, rolloff, zcr, rms]
    peak_bin = int(np.argmax(spectrum[: min(len(spectrum), 128)]))
    features[129] = peak_bin * sample_rate / 256.0
    features[130] = float(np.std(np.diff(frame[: min(len(frame), 200)])))
    features[131] = zcr * 10
    features[132] = float(np.std(np.abs(frame)))
    return features

