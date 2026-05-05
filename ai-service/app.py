import json
import pickle
from pathlib import Path

import faiss
import joblib
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models"

PRODUCTS_PATH = DATA_DIR / "products.json"
BEHAVIOR_PATH = DATA_DIR / "user_behavior.csv"
RAG_CORPUS_PATH = DATA_DIR / "rag_corpus.json"
MODEL_PATH = MODEL_DIR / "gbc_recommender.joblib"
VECTORIZER_PATH = MODEL_DIR / "tfidf.pkl"
FAISS_PATH = MODEL_DIR / "faiss.index"
COOC_PATH = MODEL_DIR / "cooccurrence.npy"
CHAT_VECTORIZER_PATH = MODEL_DIR / "chat_tfidf.pkl"
CHAT_FAISS_PATH = MODEL_DIR / "chat_faiss.index"

app = Flask(__name__)


def load_assets():
    products = json.loads(PRODUCTS_PATH.read_text())
    behavior = pd.read_csv(BEHAVIOR_PATH)
    corpus = json.loads(RAG_CORPUS_PATH.read_text()) if RAG_CORPUS_PATH.exists() else []
    classifier = joblib.load(MODEL_PATH) if MODEL_PATH.exists() else None
    with VECTORIZER_PATH.open("rb") as file:
        vectorizer = pickle.load(file)
    index = faiss.read_index(str(FAISS_PATH))
    cooccurrence = np.load(COOC_PATH)
    chat_vectorizer = None
    chat_index = None
    if CHAT_VECTORIZER_PATH.exists() and CHAT_FAISS_PATH.exists():
        with CHAT_VECTORIZER_PATH.open("rb") as file:
            chat_vectorizer = pickle.load(file)
        chat_index = faiss.read_index(str(CHAT_FAISS_PATH))
    return products, behavior, classifier, vectorizer, index, cooccurrence, corpus, chat_vectorizer, chat_index


(
    PRODUCTS,
    BEHAVIOR,
    CLASSIFIER,
    VECTORIZER,
    INDEX,
    COOC,
    RAG_CORPUS,
    CHAT_VECTORIZER,
    CHAT_INDEX,
) = load_assets()


def get_recent_sequence(user_id: int, window: int = 5):
    user_events = BEHAVIOR[BEHAVIOR["user_id"] == user_id].sort_values("timestamp")
    product_ids = user_events["product_id"].tolist()
    if len(product_ids) < window:
        return product_ids
    return product_ids[-window:]


def recommend_from_classifier(sequence, limit: int):
    if CLASSIFIER is None or len(sequence) < 5:
        return []
    sequence = np.array(sequence[-5:]).reshape(1, -1)
    probabilities = CLASSIFIER.predict_proba(sequence)[0]
    classes = CLASSIFIER.classes_
    ranked = sorted(zip(classes, probabilities), key=lambda x: x[1], reverse=True)
    return [item[0] for item in ranked[:limit]]


def recommend_from_cooc(last_product_id: int, limit: int):
    if last_product_id <= 0 or last_product_id >= COOC.shape[0]:
        return []
    scores = COOC[last_product_id]
    ranked = np.argsort(scores)[::-1]
    return [int(pid) for pid in ranked[:limit] if pid != last_product_id]


def recommend_from_rag(query: str, limit: int):
    vector = VECTORIZER.transform([query]).toarray().astype("float32")
    distances, indices = INDEX.search(vector, limit)
    return [int(idx + 1) for idx in indices[0]]


def search_corpus(query: str, limit: int):
    if CHAT_VECTORIZER is None or CHAT_INDEX is None:
        return []
    vector = CHAT_VECTORIZER.transform([query]).toarray().astype("float32")
    distances, indices = CHAT_INDEX.search(vector, limit)
    results = []
    for idx in indices[0]:
        if 0 <= idx < len(RAG_CORPUS):
            results.append(RAG_CORPUS[idx])
    return results


def hydrate_products(product_ids):
    product_map = {p["id"]: p for p in PRODUCTS}
    return [product_map[pid] for pid in product_ids if pid in product_map]


def compose_answer_vi(query: str, products, sources):
    q = (query or "").strip().lower()
    if "đổi trả" in q or "doi tra" in q or "refund" in q:
        intro = "Chính sách đổi trả: bạn có thể đổi/trả trong 14 ngày nếu sản phẩm còn nguyên trạng."
    elif "laptop" in q or "gaming" in q:
        intro = "Mình đã lọc nhanh các mẫu laptop/thiết bị phù hợp nhu cầu gaming trong tầm giá."
    elif "điện thoại" in q or "dien thoai" in q or "pin" in q:
        intro = "Mình gợi ý các mẫu điện thoại ưu tiên pin tốt và giá/hiệu năng ổn."
    elif "phụ kiện" in q or "phu kien" in q:
        intro = "Đây là các phụ kiện đang phù hợp và có tỷ lệ chọn mua cao."
    else:
        intro = "Mình đã tìm các sản phẩm phù hợp với câu hỏi của bạn."

    if products:
        top = products[:3]
        picks = ", ".join([f"{p.get('name')} (${p.get('price')})" for p in top])
        body = f"Gợi ý nổi bật: {picks}."
    else:
        body = "Hiện chưa có sản phẩm khớp rõ ràng, bạn thử thêm từ khóa thương hiệu hoặc mức giá."

    if sources:
        refs = " Tham chiếu: " + ", ".join([s.get("title", "Nguồn") for s in sources[:2]]) + "."
    else:
        refs = ""

    return f"{intro} {body}{refs}"


@app.route("/api/ai/recommend")
def recommend():
    user_id = int(request.args.get("user_id", 1))
    limit = int(request.args.get("limit", 5))

    sequence = get_recent_sequence(user_id)
    recommendations = []

    if sequence:
        recommendations.extend(recommend_from_classifier(sequence, limit))
        recommendations.extend(recommend_from_cooc(sequence[-1], limit))

    recommendations.extend(recommend_from_rag(" ".join(map(str, sequence)), limit))

    unique_ids = []
    for pid in recommendations:
        if pid not in unique_ids:
            unique_ids.append(pid)
    return jsonify({"user_id": user_id, "recommendations": hydrate_products(unique_ids[:limit])})


@app.route("/api/ai/chat/", methods=["POST"])
def chat():
    payload = request.get_json(force=True)
    query = payload.get("query", "")
    knowledge = search_corpus(query, 3)
    product_ids = recommend_from_rag(query, 5)
    products = hydrate_products(product_ids)

    response = {
        "answer": compose_answer_vi(query, products, knowledge),
        "sources": knowledge,
        "products": products,
    }
    return jsonify(response)


@app.route("/api/ai/health")
@app.route("/api/ai/health/")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
