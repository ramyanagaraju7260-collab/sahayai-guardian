from __future__ import annotations

from sahayai_x_ai.models.severity_predictor.model import SeverityPredictor


def main() -> None:
    print(SeverityPredictor().train())


if __name__ == "__main__":
    main()
