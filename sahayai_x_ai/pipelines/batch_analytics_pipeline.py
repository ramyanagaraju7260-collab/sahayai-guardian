from __future__ import annotations

import numpy as np
try:
    from sklearn.cluster import DBSCAN

    SKLEARN_READY = True
except Exception:  # pragma: no cover
    DBSCAN = None
    SKLEARN_READY = False


def build_hotspots(points: list[tuple[float, float]]) -> dict[str, object]:
    if not points:
        return {"clusters": [], "geojson": {"type": "FeatureCollection", "features": []}}
    coords = np.asarray(points, dtype=float)
    labels = DBSCAN(eps=0.05, min_samples=2).fit_predict(coords) if SKLEARN_READY else np.zeros(len(coords), dtype=int)
    features = []
    for label in sorted(set(labels)):
        if label == -1:
            continue
        cluster = coords[labels == label]
        centroid = cluster.mean(axis=0).tolist()
        features.append(
            {
                "type": "Feature",
                "properties": {"cluster_id": int(label), "count": int(cluster.shape[0])},
                "geometry": {"type": "Point", "coordinates": [centroid[1], centroid[0]]},
            }
        )
    return {"clusters": labels.tolist(), "geojson": {"type": "FeatureCollection", "features": features}}
