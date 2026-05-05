import json
import pickle
from pathlib import Path

import faiss
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.feature_extraction.text import TfidfVectorizer

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


def build_sequences(behavior: pd.DataFrame, window: int = 5):
    sequences = []
    targets = []
    for user_id, group in behavior.groupby("user_id"):
        products = group.sort_values("timestamp")["product_id"].tolist()
        for idx in range(window, len(products)):
            seq = products[idx - window : idx]
            target = products[idx]
            sequences.append(seq)
            targets.append(target)
    return np.array(sequences), np.array(targets)


def train_classifier(sequences: np.ndarray, targets: np.ndarray):
    if len(sequences) == 0:
        return None
    clf = GradientBoostingClassifier()
    clf.fit(sequences, targets)
    return clf


def build_cooccurrence(behavior: pd.DataFrame, product_count: int):
    matrix = np.zeros((product_count + 1, product_count + 1), dtype=np.int32)
    for user_id, group in behavior.groupby("user_id"):
        products = group.sort_values("timestamp")["product_id"].tolist()
        for idx in range(1, len(products)):
            prev_id = products[idx - 1]
            next_id = products[idx]
            matrix[prev_id][next_id] += 1
    return matrix


def build_rag_index(products: list):
    documents = [f"{p['name']} {p['category']} {p['brand']} {p['description']}" for p in products]
    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform(documents).toarray().astype("float32")
    index = faiss.IndexFlatL2(vectors.shape[1])
    index.add(vectors)
    return vectorizer, index


def build_corpus_index(corpus: list):
    documents = []
    for doc in corpus:
        title = doc.get("title", "")
        content = doc.get("content", "")
        tags = " ".join(doc.get("tags", []))
        documents.append(f"{title} {content} {tags}")

    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform(documents).toarray().astype("float32")
    index = faiss.IndexFlatL2(vectors.shape[1])
    index.add(vectors)
    return vectorizer, index


def main():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    products = json.loads(PRODUCTS_PATH.read_text())
    behavior = pd.read_csv(BEHAVIOR_PATH)
    corpus = json.loads(RAG_CORPUS_PATH.read_text()) if RAG_CORPUS_PATH.exists() else []

    sequences, targets = build_sequences(behavior)
    classifier = train_classifier(sequences, targets)
    if classifier:
        joblib.dump(classifier, MODEL_PATH)

    cooccurrence = build_cooccurrence(behavior, product_count=len(products))
    np.save(COOC_PATH, cooccurrence)

    vectorizer, index = build_rag_index(products)
    with VECTORIZER_PATH.open("wb") as file:
        pickle.dump(vectorizer, file)
    faiss.write_index(index, str(FAISS_PATH))

    if corpus:
        chat_vectorizer, chat_index = build_corpus_index(corpus)
        with CHAT_VECTORIZER_PATH.open("wb") as file:
            pickle.dump(chat_vectorizer, file)
        faiss.write_index(chat_index, str(CHAT_FAISS_PATH))


if __name__ == "__main__":
    main()
