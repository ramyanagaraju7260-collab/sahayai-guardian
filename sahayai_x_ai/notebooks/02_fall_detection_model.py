from __future__ import annotations

import matplotlib.pyplot as plt

from sahayai_x_ai.data.synthetic.generate_fall_data import generate_fall_dataset
from sahayai_x_ai.models.fall_detector.model import FallDetector


def main() -> None:
    windows, labels = generate_fall_dataset(samples=300)
    plt.figure(figsize=(10, 4))
    plt.plot(windows[labels == 2][0][:, 2], label="severe fall vertical acc")
    plt.legend()
    plt.tight_layout()
    plt.show()
    print(FallDetector().train(samples=1200))


if __name__ == "__main__":
    main()

