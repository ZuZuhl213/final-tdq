from __future__ import annotations

import json
import logging
from pathlib import Path

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PRODUCTS_FILE = DATA_DIR / "products.json"
POLICY_FILE = DATA_DIR / "policy.txt"
logger = logging.getLogger("ai-service")


class RagRetriever:
    def __init__(self) -> None:
        self.products = json.loads(PRODUCTS_FILE.read_text(encoding="utf-8"))
        self.policy = POLICY_FILE.read_text(encoding="utf-8")
        self.vectorizer = None
        self.matrix = None
        self.index = None
        self.index_loaded = False
        self.product_lookup = {int(product["id"]): product for product in self.products}

    def _product_text(self, product: dict) -> str:
        return (
            f"{product['name']}. {product['description']}. "
            f"Thuong hieu {product['brand']}. Danh muc {product['category']}."
        )

    def ensure_index(self) -> bool:
        if self.index_loaded and self.vectorizer is not None and self.index is not None:
            return True
        try:
            import faiss

            logger.info("Building FAISS index from %d products...", len(self.products))
            self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=2048)
            texts = [self._product_text(product) for product in self.products]
            matrix = self.vectorizer.fit_transform(texts).astype(np.float32)
            dense_matrix = matrix.toarray()
            norms = np.linalg.norm(dense_matrix, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            self.matrix = dense_matrix / norms
            self.index = faiss.IndexFlatIP(self.matrix.shape[1])
            self.index.add(self.matrix)
            self.index_loaded = True
            logger.info("FAISS index built successfully: %d vectors, %d dimensions", 
                       len(self.products), self.matrix.shape[1])
            return True
        except Exception as exc:
            logger.error("Embedding index build failed, fallback retrieval enabled: %s", exc)
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
        query_vector = self.vectorizer.transform([query]).astype(np.float32).toarray()
        norm = np.linalg.norm(query_vector, axis=1, keepdims=True)
        norm[norm == 0] = 1.0
        q_vec = query_vector / norm
        scores, idxs = self.index.search(np.array(q_vec, dtype="float32"), top_k)
        items: list[dict] = []
        for idx, score in zip(idxs[0], scores[0]):
            if idx < 0:
                continue
            item = dict(self.products[int(idx)])
            item["_score"] = float(score)
            items.append(item)
        return items

    def score_products(self, query: str, top_k: int | None = None) -> dict[int, float]:
        limit = top_k or len(self.products)
        items = self.retrieve_products(query, top_k=limit)
        if not items:
            return {}
        max_score = max(float(item.get("_score", 0.0)) for item in items) or 1.0
        return {
            int(item["id"]): float(item.get("_score", 0.0)) / max_score
            for item in items
        }

    def build_query_from_history(self, products: list[dict]) -> str:
        if not products:
            return "san pham cong nghe pho bien"
        parts = []
        for product in products[-5:]:
            parts.append(
                f"{product.get('name', '')} {product.get('category', '')} {product.get('brand', '')}"
            )
        return " ".join(parts)
