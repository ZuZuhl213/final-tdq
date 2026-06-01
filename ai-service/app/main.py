from __future__ import annotations

import json
import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from dotenv import load_dotenv

from app.fallback import build_fallback_response
from app.gemini_client import GeminiClient
from app.models import ChatRequest
from app.rag_retrieve import RagRetriever
from app.recommendation import Recommender
from app.seed_data import ensure_seed_data

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("ai-service")

app = FastAPI(title="TechStore AI Service", version="1.0.0")

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PRODUCTS_FILE = DATA_DIR / "products.json"
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

retriever: RagRetriever | None = None
recommender: Recommender | None = None
gemini_client: GeminiClient | None = None


@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info("request method=%s path=%s", request.method, request.url.path)
    response = await call_next(request)
    logger.info("response status=%s path=%s", response.status_code, request.url.path)
    return response


@app.on_event("startup")
def startup_event() -> None:
    global retriever, recommender, gemini_client
    ensure_seed_data()
    retriever = RagRetriever()
    recommender = Recommender()
    # Do not block startup on embedding/model loading.
    retriever.ensure_index()
    try:
        gemini_client = GeminiClient()
        logger.info("Gemini client initialized")
    except Exception as exc:
        gemini_client = None
        logger.error("Gemini init failed: %s", exc)


@app.get("/health")
@app.get("/api/ai/health/")
def health() -> dict:
    return {"status": "ok", "index_loaded": bool(retriever and retriever.index_loaded)}


@app.get("/api/ai/recommend")
@app.get("/api/ai/recommend/")
def recommend(user_id: int = 1, limit: int = 5, product_id: int | None = None):
    del user_id
    if recommender is None:
        raise HTTPException(status_code=503, detail="Recommender not initialized")
    items = recommender.recommend(limit=limit, product_id=product_id)
    return {"items": items, "products": items}


@app.post("/api/ai/chat/")
def chat(payload: ChatRequest):
    """Chat endpoint with RAG + Gemini, fallback to popular products."""
    if retriever is None or recommender is None:
        logger.error("Chat called but service not initialized")
        raise HTTPException(status_code=503, detail="Service not initialized")

    try:
        logger.info("Chat query: %s (user_id=%s)", payload.query[:50], payload.user_id)
        
        # Retrieve relevant products using RAG
        products = retriever.retrieve_products(payload.query, top_k=5)
        policy = (DATA_DIR / "policy.txt").read_text(encoding="utf-8")
        product_map = {p["id"]: p for p in json.loads(PRODUCTS_FILE.read_text(encoding="utf-8"))}

        # Use Gemini if available, fallback otherwise
        if gemini_client is None:
            logger.warning("Gemini client unavailable, using fallback")
            popular = recommender.recommend(limit=3)
            return build_fallback_response(popular)

        # Call Gemini with timeout
        output = gemini_client.chat_with_rag(payload.query, products, policy)

        # Validate & filter products (only in-stock)
        filtered = []
        for p in output.suggested_products:
            if p.id in product_map and int(product_map[p.id].get("stock", 0)) > 0:
                filtered.append(
                    {
                        "id": p.id,
                        "name": product_map[p.id]["name"],
                        "price": float(product_map[p.id]["price"]),
                    }
                )

        if not output.answer.strip():
            raise ValueError("Empty answer from Gemini")

        logger.info("Chat success: returned %d products", len(filtered))
        products = filtered[:5]
        return {"answer": output.answer, "suggested_products": products, "products": products}
        
    except Exception as exc:
        logger.error("Chat failed, using fallback: %s", exc, exc_info=True)
        try:
            popular = recommender.recommend(limit=3)
            return build_fallback_response(popular)
        except Exception as fallback_exc:
            logger.error("Fallback also failed: %s", fallback_exc)
            return {
                "answer": "Xin lỗi, dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.",
                "suggested_products": []
            }
        popular = recommender.recommend(limit=3)
        return build_fallback_response(popular)
