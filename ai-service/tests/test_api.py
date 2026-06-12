from pathlib import Path
import sys

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app


def test_recommend_endpoint() -> None:
    with TestClient(app) as client:
        response = client.get("/recommend", params={"user_id": 1, "limit": 5})
        assert response.status_code == 200
        payload = response.json()
        assert payload["window_size"] == 5
        assert len(payload["items"]) > 0
        assert {"rnn", "lstm", "bilstm", "graph", "rag"}.issubset(payload["weights"])


def test_chatbot_endpoint_fallback() -> None:
    with TestClient(app) as client:
        response = client.post("/chatbot", json={"query": "toi can laptop hoc tap", "user_id": 1})
        assert response.status_code == 200
        payload = response.json()
        assert "answer" in payload
        assert "suggested_products" in payload
