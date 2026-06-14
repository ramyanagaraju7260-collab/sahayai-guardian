from __future__ import annotations

from sahayai_x_ai.models.voice_panic_detector.model import VoicePanicDetector


def main() -> None:
    print(VoicePanicDetector().train())


if __name__ == "__main__":
    main()

