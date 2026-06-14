from __future__ import annotations


class EmergencyKalmanFilter:
    def __init__(self) -> None:
        self.state_probability = 0.0
        self.rate = 0.0

    def update(self, measurement: float) -> float:
        predicted = self.state_probability + self.rate * 0.1
        innovation = measurement - predicted
        self.state_probability = predicted + 0.6 * innovation
        self.rate = self.rate + 0.2 * innovation
        return max(0.0, min(1.0, self.state_probability))

