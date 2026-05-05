from __future__ import annotations


def build_fallback_response(popular_products: list[dict]) -> dict:
    return {
        "answer": "Hien tai toi chua the xu ly yeu cau nay, vui long thu lai sau.",
        "suggested_products": [
            {"id": p["id"], "name": p["name"], "price": float(p["price"])}
            for p in popular_products[:3]
        ],
    }
