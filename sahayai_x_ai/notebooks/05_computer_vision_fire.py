from __future__ import annotations

import base64
import io

from PIL import Image

from sahayai_x_ai.models.computer_vision.fire_smoke_detector import FireSmokeDetector


def main() -> None:
    image = Image.new("RGB", (224, 224), color=(240, 80, 30))
    buf = io.BytesIO()
    image.save(buf, format="PNG")
    encoded = base64.b64encode(buf.getvalue()).decode("utf-8")
    print(FireSmokeDetector().analyze(encoded))


if __name__ == "__main__":
    main()

