from __future__ import annotations


def build_fallback_response(popular_products: list[dict], query: str | None = None) -> dict:
    products = [
        {"id": p["id"], "name": p["name"], "price": float(p["price"])}
        for p in popular_products[:3]
    ]
    prompt_hint = f" cho yeu cau '{query}'" if query else ""
    return {
        "answer": (
            f"Toi dang tra loi bang che do fallback{prompt_hint}. "
            "Duoi day la cac san pham phu hop nhat hien tai dua tren lich su va truy van."
        ),
        "suggested_products": products,
        "products": products,
        "provider": "fallback",
    }
