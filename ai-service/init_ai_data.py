from pathlib import Path

from generate_behavior import main as generate_behavior
from generate_products import main as generate_products
from generate_rag_corpus import main as generate_rag_corpus
from train_ai_models import main as train_models

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models"
CHAT_INDEX = MODEL_DIR / "chat_faiss.index"
CHAT_VECTORIZER = MODEL_DIR / "chat_tfidf.pkl"


def main():
    generate_products()
    generate_behavior()
    generate_rag_corpus()

    model_file = MODEL_DIR / "gbc_recommender.joblib"
    if not model_file.exists() or not CHAT_INDEX.exists() or not CHAT_VECTORIZER.exists():
        train_models()


if __name__ == "__main__":
    main()
