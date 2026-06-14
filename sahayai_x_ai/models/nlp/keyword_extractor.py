from __future__ import annotations

import re


def extract_keywords(text: str) -> list[str]:
    tokens = re.findall(r"[a-zA-Z]{3,}", text.lower())
    stopwords = {"the", "and", "with", "from", "this", "that", "there", "need", "please"}
    seen: list[str] = []
    for token in tokens:
        if token not in stopwords and token not in seen:
            seen.append(token)
    return seen[:10]

