from __future__ import annotations

import json
import logging
from pathlib import Path

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PRODUCTS_FILE = DATA_DIR / "products.json"
POLICY_FILE = DATA_DIR / "policy.txt"
logger = logging.getLogger("ai-service")


class RagRetriever:
    def __init__(self) -> None:
        self.products = json.loads(PRODUCTS_FILE.read_text(encoding="utf-8"))
        self.policy = POLICY_FILE.read_text(encoding="utf-8")
        self.embedder = None
        self.matrix = None
        self.index = None
        self.index_loaded = False

    def ensure_index(self) -> bool:
        if self.index_loaded and self.embedder is not None and self.index is not None:
            return True
        try:
            self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
            texts = [f"{p['name']}. {p['description']}" for p in self.products]
            vectors = self.embedder.encode(texts, normalize_embeddings=True)
            self.matrix = np.array(vectors, dtype="float32")
            self.index = faiss.IndexFlatIP(self.matrix.shape[1])
            self.index.add(self.matrix)
            self.index_loaded = True
            return True
        except Exception as exc:
            logger.error("Embedding index load failed, fallback retrieval enabled: %s", exc)
            self.index_loaded = False
            return False

    def _keyword_retrieve(self, query: str, top_k: int) -> list[dict]:
        q_words = [w for w in query.lower().split() if w]
        scored = []
        for product in self.products:
            hay = f"{product.get('name', '')} {product.get('description', '')}".lower()
            score = sum(1 for w in q_words if w in hay)
            scored.append((score, product))
        scored.sort(key=lambda x: x[0], reverse=True)
        items = []
        for score, product in scored[:top_k]:
            item = dict(product)
            item["_score"] = float(score)
            items.append(item)
        return items

    def retrieve_products(self, query: str, top_k: int = 5) -> list[dict]:
        if not self.ensure_index():
            return self._keyword_retrieve(query, top_k)
        q_vec = self.embedder.encode([query], normalize_embeddings=True)
        scores, idxs = self.index.search(np.array(q_vec, dtype="float32"), top_k)
        items: list[dict] = []
        for idx, score in zip(idxs[0], scores[0]):
            if idx < 0:
                continue
            item = dict(self.products[int(idx)])
            item["_score"] = float(score)
            items.append(item)
        return items
