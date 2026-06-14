from __future__ import annotations

from sahayai_x_ai.models.fall_detector.model import FallDetector


def main() -> None:
    print(FallDetector().train())


if __name__ == "__main__":
    main()

