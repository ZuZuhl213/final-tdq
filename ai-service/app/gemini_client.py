from __future__ import annotations

import json
import os
from typing import Any

import google.generativeai as genai

from app.models import ChatResponse


class GeminiClient:
    def __init__(self) -> None:
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            raise RuntimeError("Missing GEMINI_API_KEY")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-1.0-pro")

    def chat_with_rag(self, query: str, products: list[dict], policy: str) -> ChatResponse:
        compact_products = [
            {
                "id": p["id"],
                "name": p["name"],
                "price": float(p["price"]),
                "stock": int(p["stock"]),
            }
            for p in products
        ]
        prompt = (
            "Ban la tro ly ban hang cua TechStore. Hay tra loi bang JSON, khong giai thich them.\n"
            "Du lieu shop (chi dung thong tin nay):\n"
            f"- San pham lien quan: {json.dumps(compact_products, ensure_ascii=False)}\n"
            f"- Chinh sach: {policy}\n"
            f"Cau hoi: {query}\n"
            "Tra ve JSON chinh xac:\n"
            "{\n"
            '  "answer": "cau tra loi tu nhien, ngan gon, tu van dua tren du lieu shop",\n'
            '  "suggested_products": [{"id": int, "name": string, "price": float}]\n'
            "}\n"
            "Luu y: Chi goi y san pham co stock > 0. Khong bia gia, khong bia san pham."
        )

        res = self.model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.3,
                "response_mime_type": "application/json",
            },
        )

        payload: Any = json.loads(res.text)
        validated = ChatResponse(**payload)
        return validated
