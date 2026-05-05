from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PRODUCTS_FILE = DATA_DIR / "products.json"
BEHAVIOR_FILE = DATA_DIR / "user_behavior.csv"


class Recommender:
    def __init__(self) -> None:
        self.products = json.loads(PRODUCTS_FILE.read_text(encoding="utf-8"))
        self.df = pd.read_csv(BEHAVIOR_FILE)
        self.df["timestamp"] = pd.to_datetime(self.df["timestamp"], errors="coerce")

    def _popularity_scores(self) -> dict[int, float]:
        purchases = self.df[self.df["action"] == "purchase"]
        counts = purchases.groupby("product_id").size()
        if counts.empty:
            return {}
        max_count = counts.max()
        return {int(pid): float(cnt / max_count) for pid, cnt in counts.items()}

    def _cooc_scores(self, product_id: int) -> dict[int, float]:
        df = self.df.sort_values(["user_id", "timestamp"]).copy()
        df["prev_ts"] = df.groupby("user_id")["timestamp"].shift(1)
        df["delta_min"] = (df["timestamp"] - df["prev_ts"]).dt.total_seconds().div(60)
        df["new_session"] = df["delta_min"].isna() | (df["delta_min"] > 30)
        df["session_id"] = df.groupby("user_id")["new_session"].cumsum()

        sessions = df.groupby(["user_id", "session_id"])["product_id"].apply(lambda s: set(s.tolist()))
        target_sessions = sessions[sessions.apply(lambda s: product_id in s)]
        cooc_count: dict[int, int] = {}
        for items in target_sessions:
            for item in items:
                if item == product_id:
                    continue
                cooc_count[item] = cooc_count.get(item, 0) + 1

        if not cooc_count:
            return {}
        max_count = max(cooc_count.values())
        return {int(pid): float(cnt / max_count) for pid, cnt in cooc_count.items()}

    def recommend(self, limit: int = 5, product_id: int | None = None) -> list[dict]:
        pop = self._popularity_scores()
        cooc = self._cooc_scores(product_id) if product_id else {}

        scores: dict[int, float] = {}
        product_map = {int(p["id"]): p for p in self.products}

        for pid in product_map:
            p_score = pop.get(pid, 0.0)
            c_score = cooc.get(pid, 0.0)
            score = 0.4 * p_score + 0.6 * c_score if product_id else 0.4 * p_score
            if score > 0:
                scores[pid] = score

        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:limit]
        return [
            {
                "id": pid,
                "name": product_map[pid]["name"],
                "price": float(product_map[pid]["price"]),
                "score": round(score, 4),
            }
            for pid, score in ranked
        ]
