from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class VisionArtifact:
    model_name: str
    fallback: bool = True


def load_artifact(name: str) -> VisionArtifact:
    return VisionArtifact(model_name=name, fallback=True)

