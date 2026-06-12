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
    retriever.ensure_index()
    recommender = Recommender(retriever=retriever)
    try:
        gemini_client = GeminiClient()
        logger.info("LLM client initialized")
    except Exception as exc:
        gemini_client = None
        logger.warning("LLM client unavailable, fallback mode enabled: %s", exc)


@app.on_event("shutdown")
def shutdown_event() -> None:
    if recommender is not None:
        recommender.close()


@app.get("/health")
@app.get("/api/ai/health/")
def health() -> dict:
    return {
        "status": "ok",
        "index_loaded": bool(retriever and retriever.index_loaded),
        "models_loaded": list(recommender.trained_models) if recommender else [],
        "graph_backend": "neo4j" if recommender and recommender.graph_signal.neo4j_enabled else "in_memory",
        "llm_provider": gemini_client.provider if gemini_client else "fallback",
    }


@app.get("/recommend")
@app.get("/api/ai/recommend")
@app.get("/api/ai/recommend/")
def recommend(user_id: int = 1, limit: int = 5, query: str | None = None):
    if recommender is None:
        raise HTTPException(status_code=503, detail="Recommender not initialized")
    return recommender.recommend(user_id=user_id, limit=limit, query=query)


@app.post("/chatbot")
@app.post("/api/ai/chat/")
def chat(payload: ChatRequest):
    """Chat endpoint with hybrid recommendation + RAG + LLM/fallback."""
    if retriever is None or recommender is None:
        logger.error("Chat called but service not initialized")
        raise HTTPException(status_code=503, detail="Service not initialized")

    try:
        logger.info("Chat query: %s (user_id=%s)", payload.query[:50], payload.user_id)

        recommendation = recommender.recommend(user_id=payload.user_id or 1, limit=5, query=payload.query)
        products = retriever.retrieve_products(payload.query, top_k=5)
        hybrid_products = [
            {
                "id": item["id"],
                "name": item["name"],
                "price": item["price"],
                "stock": int(recommender.product_lookup[item["id"]]["stock"]),
                "category": recommender.product_lookup[item["id"]]["category"],
                "brand": recommender.product_lookup[item["id"]]["brand"],
            }
            for item in recommendation["items"]
        ]
        hybrid_ids = {int(product["id"]) for product in hybrid_products}
        merged_products = hybrid_products + [product for product in products if int(product["id"]) not in hybrid_ids]
        policy = (DATA_DIR / "policy.txt").read_text(encoding="utf-8")
        product_map = {p["id"]: p for p in json.loads(PRODUCTS_FILE.read_text(encoding="utf-8"))}

        if gemini_client is None:
            logger.warning("LLM client unavailable, using fallback")
            return build_fallback_response(recommendation["items"], query=payload.query)

        output = gemini_client.chat_with_rag(payload.query, merged_products[:5], policy)

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
            raise ValueError("Empty answer from LLM")

        logger.info("Chat success: returned %d products", len(filtered))
        products = filtered[:5]
        if not products:
            products = [
                {"id": item["id"], "name": item["name"], "price": item["price"]}
                for item in recommendation["items"][:5]
            ]
        return {
            "answer": output.answer,
            "suggested_products": products,
            "products": products,
            "provider": gemini_client.provider,
            "recommendation": recommendation,
        }

    except Exception as exc:
        logger.error("Chat failed, using fallback: %s", exc, exc_info=True)
        try:
            fallback = recommender.recommend(user_id=payload.user_id or 1, limit=3, query=payload.query)
            response = build_fallback_response(fallback["items"], query=payload.query)
            response["recommendation"] = fallback
            return response
        except Exception as fallback_exc:
            logger.error("Fallback also failed: %s", fallback_exc)
            return {
                "answer": "Xin lỗi, dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.",
                "suggested_products": [],
                "provider": "fallback",
            }
