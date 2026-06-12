# TechStore AI Service

FastAPI microservice for hybrid recommendation and product chatbot.

## What Is Implemented

- FastAPI service with 2 required endpoints:
  - `GET /recommend?user_id=1`
  - `POST /chatbot`
- Alias endpoints for gateway compatibility:
  - `GET /api/ai/recommend`
  - `POST /api/ai/chat/`
- Sequence recommendation with `window_size=5` on user behavior time series.
- Three trained sequence models in PyTorch:
  - `RNN` (`nn.RNN`, equivalent to SimpleRNN-style sequence model)
  - `LSTM`
  - `biLSTM` (`nn.LSTM(..., bidirectional=True)`)
- Hybrid score:

```text
final_score = w1 * rnn + w2 * lstm + w3 * bilstm + w4 * graph + w5 * rag
```

- Knowledge-graph signal:
  - Runtime support for Neo4j via `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`
  - In-memory graph fallback when Neo4j is not configured
- RAG retrieval using `TF-IDF embedding + FAISS`
- LLM integration:
  - Gemini if `GEMINI_API_KEY` is available
  - Groq if `GROQ_API_KEY` is available
  - Fallback response if external LLM call fails

## Data Contract

Behavior file: `data/user_behavior.csv`

- `user_id`
- `product_id`
- `action`
- `timestamp`

Actions are normalized to `view`, `click`, `add_to_cart`.

## Key Files

- `app/main.py`: FastAPI app and API endpoints
- `app/recommendation.py`: sequence training, hybrid scoring, graph logic
- `app/rag_retrieve.py`: FAISS index and retrieval scoring
- `app/gemini_client.py`: Gemini/Groq LLM client
- `tests/test_api.py`: API smoke tests with `TestClient`

## Setup

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Optional environment variables:

```bash
export GEMINI_API_KEY="..."
export GEMINI_MODEL="gemini-1.5-flash"

export GROQ_API_KEY="..."
export GROQ_MODEL="llama-3.1-8b-instant"

export NEO4J_URI="bolt://localhost:7687"
export NEO4J_USER="neo4j"
export NEO4J_PASSWORD="your-password"

export HYBRID_WEIGHTS="0.2,0.25,0.25,0.15,0.15"
export SEQUENCE_EPOCHS="4"
```

## Run

```bash
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

## Quick Test

```bash
pytest tests/test_api.py

curl "http://127.0.0.1:5000/recommend?user_id=1&limit=5"

curl -X POST "http://127.0.0.1:5000/chatbot" \
  -H "Content-Type: application/json" \
  -d '{"query":"toi can laptop hoc tap","user_id":1}'
```

## Verified Locally

- `pytest tests/test_api.py` passed.
- Live HTTP smoke test on `/recommend` and `/chatbot` passed.
- Sequence models were trained and cached into `data/artifacts/`.
- In the current local environment:
  - graph backend ran in `in_memory` mode because Neo4j was not configured
  - chatbot returned valid fallback output because the available Gemini configuration responded with model-not-found

## Notes

- Recommendation works without external services.
- Neo4j support is implemented, but requires a running Neo4j instance to activate.
- Chatbot always responds, but rich LLM generation depends on a valid Gemini or Groq setup.
