# TechStore AI Service

FastAPI service for product recommendation and RAG chatbot using FAISS + Gemini API.

## Features
- `GET /health` => `{ "status": "ok", "index_loaded": true }`
- `GET /api/ai/recommend?user_id=1&limit=5&product_id=10`
- `POST /api/ai/chat/` with body:
  - `{ "query": "toi can laptop gaming duoi 15 trieu", "user_id": 1 }`

## Data seed
Auto-generate on first startup (if missing):
- `data/products.json` (50 products)
- `data/user_behavior.csv` (5000 rows)
- `data/policy.txt`

## Run local
```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 5000
```

## Run docker
```bash
docker build -t techstore-ai-service ./ai-service
docker run --rm -p 5000:5000 --env-file ./ai-service/.env techstore-ai-service
```

## Env
Copy `.env.example` -> `.env` and set `GEMINI_API_KEY`.

If Gemini is unavailable or returns invalid JSON, service falls back to rule-based response + top 3 popular products.
