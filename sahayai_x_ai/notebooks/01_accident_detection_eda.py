from __future__ import annotations

import matplotlib.pyplot as plt
import numpy as np

from sahayai_x_ai.data.synthetic.generate_accident_data import generate_accident_dataset
from sahayai_x_ai.models.accident_detector.model import AccidentDetector


def main() -> None:
    windows, labels = generate_accident_dataset(samples=500)
    total_acc = np.linalg.norm(windows[:, :, :3], axis=2)
    plt.figure(figsize=(10, 4))
    plt.plot(total_acc[labels == 0][0], label="normal")
    plt.plot(total_acc[labels == 1][0], label="accident")
    plt.legend()
    plt.title("Accident vs normal total acceleration")
    plt.tight_layout()
    plt.show()
    print(AccidentDetector().train(samples=1500))


if __name__ == "__main__":
    main()

