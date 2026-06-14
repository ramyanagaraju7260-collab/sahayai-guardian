from __future__ import annotations

from sahayai_x_ai.models.accident_detector.model import AccidentDetector


def main() -> None:
    detector = AccidentDetector()
    metrics = detector.train()
    print(metrics)


if __name__ == "__main__":
    main()

