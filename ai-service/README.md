# TechStore AI Service

FastAPI service for product recommendation and RAG chatbot using FAISS + Gemini API.

## Architecture

- **FastAPI** backend with async support
- **FAISS** (Facebook AI Similarity Search) for vector-based product retrieval
- **Sentence-Transformers** (all-MiniLM-L6-v2) for embeddings
- **Gemini 1.5 Flash** for conversational AI
- Auto-seeding: 50 products, 5000 user behavior rows, shop policy

## Features

### Endpoints

- `GET /health` → `{ "status": "ok", "index_loaded": true }`
- `GET /api/ai/recommend?user_id=1&limit=5&product_id=10` → Recommend based on popularity + co-occurrence
- `POST /api/ai/chat/` → RAG chatbot with Gemini

### Request/Response

```bash
# Chat endpoint
POST /api/ai/chat/
{
  "query": "toi can laptop gaming duoi 15 trieu",
  "user_id": 1
}

# Response
{
  "answer": "Mình đã lọc nhanh các mẫu laptop gaming trong tầm giá...",
  "suggested_products": [
    {"id": 5, "name": "Dell Laptop 5", "price": 14990000},
    ...
  ]
}
```

## Data Seeding

Auto-generate on first startup (if missing):
- `data/products.json` - 50 tech products with name, description, price, stock
- `data/user_behavior.csv` - 5000 rows of user actions (view, click, add_to_cart, purchase)
- `data/policy.txt` - Shop policies (refund, shipping, warranty)

## Error Handling & Fallback

- **Gemini unavailable**: Fallback to rule-based response + top 3 popular products
- **Invalid JSON**: Retry up to 2 times, then fallback
- **Timeout**: 15-second timeout per Gemini request with retry logic
- **Empty stock**: Filter out out-of-stock products from recommendations

## Run Local

```bash
cd ai-service

# Setup
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Set Gemini API key
export GEMINI_API_KEY="your-key-here"

# Run
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload

# Test
curl http://localhost:5000/health
curl -X POST http://localhost:5000/api/ai/chat/ \
  -H "Content-Type: application/json" \
  -d '{"query":"laptop dui 15 trieu","user_id":1}'
```

## Run Docker

```bash
# Build
docker build -t techstore-ai-service ./ai-service

# Run
docker run --rm \
  -p 5000:5000 \
  --env GEMINI_API_KEY="your-key" \
  techstore-ai-service

# Or with .env file
docker run --rm \
  -p 5000:5000 \
  --env-file ./ai-service/.env \
  techstore-ai-service
```

## Configuration

Create `.env` file (copy from `.env.example`):

```
GEMINI_API_KEY=your_gemini_api_key_here
```

## Logging

All requests/responses logged to console at INFO level:
```
2026-05-12 10:30:45,123 INFO Chat query: toi can laptop (user_id=1)
2026-05-12 10:30:50,456 INFO Chat success: returned 3 products
```

## Performance Notes

- **Embedding**: ~500-1000ms on CPU (first time, then cached)
- **RAG retrieval**: ~10-50ms (FAISS in-memory)
- **Gemini call**: ~3-8 seconds (network latency)
- **Total chat latency**: ~5-10 seconds typically

## Future Improvements

- [ ] Redis caching for popular queries
- [ ] Async Gemini API calls
- [ ] Batch processing for multiple users
- [ ] Custom embedding model fine-tuned on shop data
- [ ] A/B testing different prompt templates
- [ ] Metrics tracking (latency, success rate, user feedback)
