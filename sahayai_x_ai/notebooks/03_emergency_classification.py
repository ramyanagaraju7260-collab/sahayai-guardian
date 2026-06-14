from __future__ import annotations

import numpy as np

from sahayai_x_ai.data.synthetic.generate_emergency_data import generate_emergency_feature_dataset
from sahayai_x_ai.models.emergency_classifier.model import EmergencyClassifier


def main() -> None:
    features, labels = generate_emergency_feature_dataset(samples=600)
    print({"feature_mean": float(np.mean(features)), "class_count": len(set(labels.tolist()))})
    print(EmergencyClassifier().train(samples=2000))


if __name__ == "__main__":
    main()

