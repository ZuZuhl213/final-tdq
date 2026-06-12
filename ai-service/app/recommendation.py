from __future__ import annotations

import json
import logging
import os
import random
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from torch import nn
from torch.utils.data import DataLoader, Dataset, random_split

from app.rag_retrieve import RagRetriever

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PRODUCTS_FILE = Path(os.getenv("PRODUCTS_FILE", str(DATA_DIR / "products.json")))
BEHAVIOR_FILE = Path(os.getenv("BEHAVIOR_FILE", str(DATA_DIR / "user_behavior.csv")))
ARTIFACT_DIR = Path(os.getenv("ARTIFACT_DIR", str(DATA_DIR / "artifacts")))
WINDOW_SIZE = 5
MODEL_NAMES = ("rnn", "lstm", "bilstm")
DEFAULT_WEIGHTS = {
    "rnn": 0.2,
    "lstm": 0.25,
    "bilstm": 0.25,
    "graph": 0.15,
    "rag": 0.15,
}
ACTION_ALIASES = {
    "view": "view",
    "click": "click",
    "add_to_cart": "add_to_cart",
    "purchase": "add_to_cart",
}
ACTION_SIGNAL = {"view": 1.0, "click": 2.0, "add_to_cart": 3.0}
logger = logging.getLogger("ai-service")


def _set_seed(seed: int = 42) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


class SequenceDataset(Dataset):
    def __init__(self, product_sequences: list[list[int]], action_sequences: list[list[int]], targets: list[int]) -> None:
        self.product_sequences = torch.tensor(product_sequences, dtype=torch.long)
        self.action_sequences = torch.tensor(action_sequences, dtype=torch.long)
        self.targets = torch.tensor(targets, dtype=torch.long)

    def __len__(self) -> int:
        return len(self.targets)

    def __getitem__(self, index: int):
        return (
            self.product_sequences[index],
            self.action_sequences[index],
            self.targets[index],
        )


class SequenceModel(nn.Module):
    def __init__(
        self,
        model_name: str,
        num_products: int,
        num_actions: int,
        product_embedding_dim: int = 32,
        action_embedding_dim: int = 8,
        hidden_dim: int = 48,
    ) -> None:
        super().__init__()
        self.model_name = model_name
        self.product_embedding = nn.Embedding(num_products, product_embedding_dim, padding_idx=0)
        self.action_embedding = nn.Embedding(num_actions, action_embedding_dim, padding_idx=0)
        input_dim = product_embedding_dim + action_embedding_dim
        if model_name == "rnn":
            self.sequence = nn.RNN(input_dim, hidden_dim, batch_first=True)
            output_dim = hidden_dim
        elif model_name == "lstm":
            self.sequence = nn.LSTM(input_dim, hidden_dim, batch_first=True)
            output_dim = hidden_dim
        elif model_name == "bilstm":
            self.sequence = nn.LSTM(input_dim, hidden_dim, batch_first=True, bidirectional=True)
            output_dim = hidden_dim * 2
        else:
            raise ValueError(f"Unsupported model_name={model_name}")
        self.dropout = nn.Dropout(0.1)
        self.output = nn.Linear(output_dim, num_products)

    def forward(self, product_ids: torch.Tensor, action_ids: torch.Tensor) -> torch.Tensor:
        product_vectors = self.product_embedding(product_ids)
        action_vectors = self.action_embedding(action_ids)
        features = torch.cat([product_vectors, action_vectors], dim=-1)
        sequence_output, _ = self.sequence(features)
        last_hidden = sequence_output[:, -1, :]
        logits = self.output(self.dropout(last_hidden))
        logits[:, 0] = -1e9
        return logits


@dataclass
class TrainedModel:
    name: str
    model: SequenceModel
    top1_accuracy: float
    top5_accuracy: float


class GraphSignal:
    def __init__(self, df: pd.DataFrame, products: list[dict]) -> None:
        self.df = df.copy()
        self.products = products
        self.product_lookup = {int(product["id"]): product for product in products}
        self.product_similarity = self._build_similarity_map()
        self.transition_scores = self._build_transition_map()
        self.neo4j_enabled = False
        self.neo4j_error: str | None = None
        self.driver = None
        self._init_neo4j()

    def _build_similarity_map(self) -> dict[int, dict[int, float]]:
        similarity: dict[int, dict[int, float]] = {}
        for source in self.products:
            source_id = int(source["id"])
            scores: dict[int, float] = {}
            for target in self.products:
                target_id = int(target["id"])
                if source_id == target_id:
                    continue
                score = 0.0
                if source.get("category") == target.get("category"):
                    score += 0.7
                if source.get("brand") == target.get("brand"):
                    score += 0.3
                if score > 0:
                    scores[target_id] = score
            similarity[source_id] = scores
        return similarity

    def _build_transition_map(self) -> dict[int, dict[int, float]]:
        sorted_df = self.df.sort_values(["user_id", "timestamp"]).copy()
        sorted_df["next_product_id"] = sorted_df.groupby("user_id")["product_id"].shift(-1)
        sorted_df["action_weight"] = sorted_df["normalized_action"].map(ACTION_SIGNAL).fillna(1.0)

        transitions: dict[int, dict[int, float]] = {}
        for row in sorted_df.itertuples(index=False):
            if pd.isna(row.next_product_id):
                continue
            source_id = int(row.product_id)
            target_id = int(row.next_product_id)
            if source_id == target_id:
                continue
            source_scores = transitions.setdefault(source_id, {})
            source_scores[target_id] = source_scores.get(target_id, 0.0) + float(row.action_weight)

        for source_id, scores in transitions.items():
            max_score = max(scores.values()) or 1.0
            for target_id, value in list(scores.items()):
                similarity_bonus = self.product_similarity.get(source_id, {}).get(target_id, 0.0)
                scores[target_id] = (value / max_score) + similarity_bonus
        return transitions

    def _init_neo4j(self) -> None:
        uri = os.getenv("NEO4J_URI", "").strip()
        user = os.getenv("NEO4J_USER", "neo4j").strip()
        password = os.getenv("NEO4J_PASSWORD", "").strip()
        if not uri or not password:
            self.neo4j_error = "Neo4j credentials not configured"
            return
        try:
            from neo4j import GraphDatabase

            self.driver = GraphDatabase.driver(uri, auth=(user, password))
            self.driver.verify_connectivity()
            self.neo4j_enabled = True
            self._sync_neo4j()
            logger.info("Neo4j graph synchronization completed")
        except Exception as exc:
            self.neo4j_error = str(exc)
            self.neo4j_enabled = False
            self.driver = None
            logger.warning("Neo4j unavailable, using in-memory graph only: %s", exc)

    def _sync_neo4j(self) -> None:
        if self.driver is None:
            return
        product_rows = [
            {
                "id": int(product["id"]),
                "name": product["name"],
                "category": product["category"],
                "brand": product["brand"],
            }
            for product in self.products
        ]
        transition_rows = [
            {"source": source, "target": target, "weight": round(weight, 4)}
            for source, targets in self.transition_scores.items()
            for target, weight in targets.items()
        ]
        with self.driver.session() as session:
            session.run(
                "UNWIND $rows AS row "
                "MERGE (p:Product {id: row.id}) "
                "SET p.name = row.name, p.category = row.category, p.brand = row.brand",
                rows=product_rows,
            )
            if transition_rows:
                session.run(
                    "UNWIND $rows AS row "
                    "MATCH (src:Product {id: row.source}) "
                    "MATCH (dst:Product {id: row.target}) "
                    "MERGE (src)-[r:TRANSITION]->(dst) "
                    "SET r.weight = row.weight",
                    rows=transition_rows,
                )

    def _score_from_memory(self, recent_product_ids: list[int]) -> dict[int, float]:
        scores: dict[int, float] = {}
        if not recent_product_ids:
            return scores
        for rank, product_id in enumerate(reversed(recent_product_ids), start=1):
            decay = 1.0 / rank
            for target_id, value in self.transition_scores.get(product_id, {}).items():
                scores[target_id] = scores.get(target_id, 0.0) + (value * decay)
            for target_id, value in self.product_similarity.get(product_id, {}).items():
                scores[target_id] = scores.get(target_id, 0.0) + (value * 0.2 * decay)
        if not scores:
            return {}
        max_score = max(scores.values()) or 1.0
        return {product_id: score / max_score for product_id, score in scores.items()}

    def _score_from_neo4j(self, recent_product_ids: list[int]) -> dict[int, float]:
        if not self.neo4j_enabled or self.driver is None or not recent_product_ids:
            return {}
        query = (
            "UNWIND $recent_ids AS recent_id "
            "MATCH (src:Product {id: recent_id})-[r:TRANSITION]->(dst:Product) "
            "RETURN dst.id AS product_id, sum(r.weight) AS score "
            "ORDER BY score DESC LIMIT 50"
        )
        with self.driver.session() as session:
            rows = list(session.run(query, recent_ids=recent_product_ids))
        if not rows:
            return {}
        max_score = max(float(row["score"]) for row in rows) or 1.0
        return {int(row["product_id"]): float(row["score"]) / max_score for row in rows}

    def score_products(self, recent_product_ids: list[int]) -> dict[int, float]:
        neo4j_scores = self._score_from_neo4j(recent_product_ids)
        if neo4j_scores:
            return neo4j_scores
        return self._score_from_memory(recent_product_ids)

    def close(self) -> None:
        if self.driver is not None:
            self.driver.close()


class Recommender:
    def __init__(self, retriever: RagRetriever | None = None, window_size: int = WINDOW_SIZE) -> None:
        _set_seed()
        ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
        self.window_size = window_size
        self.products = json.loads(PRODUCTS_FILE.read_text(encoding="utf-8"))
        self.product_lookup = {int(product["id"]): product for product in self.products}
        self.df = pd.read_csv(BEHAVIOR_FILE)
        self.df["timestamp"] = pd.to_datetime(self.df["timestamp"], errors="coerce")
        self.df["normalized_action"] = self.df["action"].map(ACTION_ALIASES).fillna("view")
        self.df = self.df.dropna(subset=["timestamp"]).sort_values(["user_id", "timestamp"]).reset_index(drop=True)
        self.action_to_idx = {action: index for index, action in enumerate(["<pad>", "view", "click", "add_to_cart"])}
        self.product_to_idx = {0: 0}
        self.idx_to_product = {0: 0}
        for index, product_id in enumerate(sorted(self.product_lookup), start=1):
            self.product_to_idx[product_id] = index
            self.idx_to_product[index] = product_id
        self.sequence_samples = self._build_sequence_samples()
        self.dataset = SequenceDataset(*self.sequence_samples)
        self.trained_models = self._load_or_train_models()
        self.graph_signal = GraphSignal(self.df, self.products)
        self.retriever = retriever or RagRetriever()
        self.weights = self._load_weights()
        self.model_metrics = {
            trained_model.name: {
                "top1_accuracy": round(trained_model.top1_accuracy, 4),
                "top5_accuracy": round(trained_model.top5_accuracy, 4),
            }
            for trained_model in self.trained_models.values()
        }

    def _load_weights(self) -> dict[str, float]:
        raw = os.getenv("HYBRID_WEIGHTS", "").strip()
        if not raw:
            return dict(DEFAULT_WEIGHTS)
        try:
            values = [float(value.strip()) for value in raw.split(",")]
            if len(values) != 5:
                raise ValueError("HYBRID_WEIGHTS must contain 5 numbers")
            keys = ["rnn", "lstm", "bilstm", "graph", "rag"]
            total = sum(values) or 1.0
            return {key: value / total for key, value in zip(keys, values)}
        except Exception as exc:
            logger.warning("Invalid HYBRID_WEIGHTS, using defaults: %s", exc)
            return dict(DEFAULT_WEIGHTS)

    def _build_sequence_samples(self) -> tuple[list[list[int]], list[list[int]], list[int]]:
        product_sequences: list[list[int]] = []
        action_sequences: list[list[int]] = []
        targets: list[int] = []
        for _, user_df in self.df.groupby("user_id"):
            product_ids = [self.product_to_idx.get(int(product_id), 0) for product_id in user_df["product_id"].tolist()]
            action_ids = [self.action_to_idx.get(action, 0) for action in user_df["normalized_action"].tolist()]
            for index in range(1, len(product_ids)):
                start = max(0, index - self.window_size)
                product_window = product_ids[start:index]
                action_window = action_ids[start:index]
                if len(product_window) < self.window_size:
                    padding = [0] * (self.window_size - len(product_window))
                    product_window = padding + product_window
                    action_window = padding + action_window
                product_sequences.append(product_window)
                action_sequences.append(action_window)
                targets.append(product_ids[index])
        return product_sequences, action_sequences, targets

    def _artifact_path(self, model_name: str) -> Path:
        return ARTIFACT_DIR / f"{model_name}_sequence_model.pt"

    def _train_model(self, model_name: str) -> TrainedModel:
        if len(self.dataset) == 0:
            model = SequenceModel(model_name, len(self.product_to_idx), len(self.action_to_idx))
            return TrainedModel(name=model_name, model=model.eval(), top1_accuracy=0.0, top5_accuracy=0.0)

        dataset_size = len(self.dataset)
        val_size = max(1, int(dataset_size * 0.2))
        train_size = max(1, dataset_size - val_size)
        if train_size + val_size > dataset_size:
            val_size = dataset_size - train_size
        generator = torch.Generator().manual_seed(42)
        train_dataset, val_dataset = random_split(self.dataset, [train_size, val_size], generator=generator)
        train_loader = DataLoader(train_dataset, batch_size=128, shuffle=True)
        val_loader = DataLoader(val_dataset, batch_size=256, shuffle=False)

        model = SequenceModel(model_name, len(self.product_to_idx), len(self.action_to_idx))
        optimizer = torch.optim.Adam(model.parameters(), lr=0.003)
        criterion = nn.CrossEntropyLoss()
        model.train()
        epochs = int(os.getenv("SEQUENCE_EPOCHS", "4"))
        for _ in range(epochs):
            for product_batch, action_batch, target_batch in train_loader:
                optimizer.zero_grad()
                logits = model(product_batch, action_batch)
                loss = criterion(logits, target_batch)
                loss.backward()
                optimizer.step()

        top1_accuracy, top5_accuracy = self._evaluate_model(model, val_loader)
        artifact = {
            "state_dict": model.state_dict(),
            "top1_accuracy": top1_accuracy,
            "top5_accuracy": top5_accuracy,
            "window_size": self.window_size,
            "num_products": len(self.product_to_idx),
            "num_actions": len(self.action_to_idx),
        }
        torch.save(artifact, self._artifact_path(model_name))
        logger.info(
            "Trained %s model with top1=%.4f top5=%.4f",
            model_name,
            top1_accuracy,
            top5_accuracy,
        )
        model.eval()
        return TrainedModel(name=model_name, model=model, top1_accuracy=top1_accuracy, top5_accuracy=top5_accuracy)

    def _evaluate_model(self, model: SequenceModel, loader: DataLoader) -> tuple[float, float]:
        if len(loader.dataset) == 0:
            return 0.0, 0.0
        model.eval()
        total = 0
        correct_top1 = 0
        correct_top5 = 0
        with torch.no_grad():
            for product_batch, action_batch, target_batch in loader:
                logits = model(product_batch, action_batch)
                top1 = logits.argmax(dim=1)
                top5 = logits.topk(k=min(5, logits.shape[1]), dim=1).indices
                total += target_batch.shape[0]
                correct_top1 += int((top1 == target_batch).sum().item())
                correct_top5 += int((top5 == target_batch.unsqueeze(1)).any(dim=1).sum().item())
        model.train()
        return correct_top1 / total, correct_top5 / total

    def _load_or_train_models(self) -> dict[str, TrainedModel]:
        trained_models: dict[str, TrainedModel] = {}
        for model_name in MODEL_NAMES:
            artifact_path = self._artifact_path(model_name)
            if artifact_path.exists() and artifact_path.stat().st_mtime >= BEHAVIOR_FILE.stat().st_mtime:
                artifact = torch.load(artifact_path, map_location="cpu")
                model = SequenceModel(model_name, len(self.product_to_idx), len(self.action_to_idx))
                model.load_state_dict(artifact["state_dict"])
                model.eval()
                trained_models[model_name] = TrainedModel(
                    name=model_name,
                    model=model,
                    top1_accuracy=float(artifact.get("top1_accuracy", 0.0)),
                    top5_accuracy=float(artifact.get("top5_accuracy", 0.0)),
                )
                logger.info("Loaded cached %s model", model_name)
            else:
                trained_models[model_name] = self._train_model(model_name)
        return trained_models

    def _user_history(self, user_id: int) -> pd.DataFrame:
        return self.df[self.df["user_id"] == user_id].sort_values("timestamp")

    def _prepare_user_window(self, user_id: int) -> tuple[torch.Tensor, torch.Tensor, list[int], list[dict]]:
        history = self._user_history(user_id)
        if history.empty:
            return (
                torch.zeros((1, self.window_size), dtype=torch.long),
                torch.zeros((1, self.window_size), dtype=torch.long),
                [],
                [],
            )
        recent = history.tail(self.window_size)
        product_window = [self.product_to_idx.get(int(product_id), 0) for product_id in recent["product_id"].tolist()]
        action_window = [self.action_to_idx.get(action, 0) for action in recent["normalized_action"].tolist()]
        if len(product_window) < self.window_size:
            padding = [0] * (self.window_size - len(product_window))
            product_window = padding + product_window
            action_window = padding + action_window
        history_products = [int(product_id) for product_id in recent["product_id"].tolist()]
        history_payload = []
        for row in recent.itertuples(index=False):
            history_payload.append(
                {
                    "product_id": int(row.product_id),
                    "action": row.normalized_action,
                    "timestamp": row.timestamp.isoformat(),
                }
            )
        return (
            torch.tensor([product_window], dtype=torch.long),
            torch.tensor([action_window], dtype=torch.long),
            history_products,
            history_payload,
        )

    def _sequence_scores(self, product_tensor: torch.Tensor, action_tensor: torch.Tensor) -> dict[str, dict[int, float]]:
        outputs: dict[str, dict[int, float]] = {}
        with torch.no_grad():
            for model_name, trained_model in self.trained_models.items():
                logits = trained_model.model(product_tensor, action_tensor)
                probabilities = torch.softmax(logits, dim=1)[0].cpu().numpy()
                outputs[model_name] = {
                    self.idx_to_product[index]: float(probability)
                    for index, probability in enumerate(probabilities)
                    if index != 0 and self.idx_to_product.get(index, 0) != 0
                }
        return outputs

    def _popularity_scores(self) -> dict[int, float]:
        counts = self.df.groupby("product_id").size()
        if counts.empty:
            return {}
        max_count = float(counts.max()) or 1.0
        return {int(product_id): float(count / max_count) for product_id, count in counts.items()}

    def recommend(self, user_id: int = 1, limit: int = 5, query: str | None = None) -> dict:
        product_tensor, action_tensor, history_product_ids, history_payload = self._prepare_user_window(user_id)
        sequence_scores = self._sequence_scores(product_tensor, action_tensor)
        history_products = [self.product_lookup[product_id] for product_id in history_product_ids if product_id in self.product_lookup]
        rag_query = query or self.retriever.build_query_from_history(history_products)
        graph_scores = self.graph_signal.score_products(history_product_ids)
        rag_scores = self.retriever.score_products(rag_query)
        popularity_scores = self._popularity_scores()

        final_scores: dict[int, float] = {}
        component_scores: dict[int, dict[str, float]] = {}
        for product_id, product in self.product_lookup.items():
            if int(product.get("stock", 0)) <= 0:
                continue
            parts = {
                "rnn": sequence_scores.get("rnn", {}).get(product_id, 0.0),
                "lstm": sequence_scores.get("lstm", {}).get(product_id, 0.0),
                "bilstm": sequence_scores.get("bilstm", {}).get(product_id, 0.0),
                "graph": graph_scores.get(product_id, 0.0),
                "rag": rag_scores.get(product_id, 0.0),
                "popularity": popularity_scores.get(product_id, 0.0),
            }
            final_score = (
                self.weights["rnn"] * parts["rnn"]
                + self.weights["lstm"] * parts["lstm"]
                + self.weights["bilstm"] * parts["bilstm"]
                + self.weights["graph"] * parts["graph"]
                + self.weights["rag"] * parts["rag"]
            )
            if final_score <= 0:
                final_score = parts["popularity"] * 0.05
            final_scores[product_id] = final_score
            component_scores[product_id] = parts

        ranked = sorted(final_scores.items(), key=lambda item: item[1], reverse=True)[:limit]
        items = []
        for product_id, final_score in ranked:
            product = self.product_lookup[product_id]
            items.append(
                {
                    "id": product_id,
                    "name": product["name"],
                    "price": float(product["price"]),
                    "score": round(float(final_score), 6),
                    "component_scores": {
                        key: round(float(value), 6)
                        for key, value in component_scores[product_id].items()
                    },
                }
            )

        return {
            "user_id": user_id,
            "window_size": self.window_size,
            "weights": {key: round(value, 4) for key, value in self.weights.items()},
            "history": history_payload,
            "rag_query": rag_query,
            "graph_backend": "neo4j" if self.graph_signal.neo4j_enabled else "in_memory",
            "model_metrics": self.model_metrics,
            "items": items,
            "products": items,
        }

    def close(self) -> None:
        self.graph_signal.close()
