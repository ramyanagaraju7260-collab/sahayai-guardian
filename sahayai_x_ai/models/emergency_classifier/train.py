from __future__ import annotations

from sahayai_x_ai.models.emergency_classifier.model import EmergencyClassifier


def main() -> None:
    print(EmergencyClassifier().train())


if __name__ == "__main__":
    main()

