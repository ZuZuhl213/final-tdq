from __future__ import annotations

import json
import logging
import os
from typing import Any

import requests

from app.models import ChatResponse

logger = logging.getLogger("ai-service")


class GeminiClient:
    """LLM client that supports Gemini first, then Groq."""

    def __init__(self) -> None:
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.timeout_seconds = 30
        self.max_retries = 2
        self.provider = ""
        self.model = ""
        self.gemini_models: list[str] = []

        if self.gemini_api_key:
            self.provider = "gemini"
            self.model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
            self.gemini_models = [
                self.model,
                f"models/{self.model}" if not self.model.startswith("models/") else self.model.removeprefix("models/"),
                "gemini-1.5-flash-latest",
                "models/gemini-1.5-flash-latest",
                "gemini-1.5-pro-latest",
                "models/gemini-1.5-pro-latest",
            ]
        elif self.groq_api_key:
            self.provider = "groq"
            self.model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
            self.base_url = "https://api.groq.com/openai/v1"
        else:
            raise RuntimeError("Missing GEMINI_API_KEY or GROQ_API_KEY")

        logger.info("LLM client initialized with provider=%s model=%s", self.provider, self.model)

    def _build_prompt(self, query: str, products: list[dict], policy: str) -> str:
        compact_products = [
            {
                "id": p["id"],
                "name": p["name"],
                "category": p.get("category"),
                "brand": p.get("brand"),
                "price": float(p["price"]),
                "stock": int(p["stock"]),
            }
            for p in products
        ]
        return (
            "Ban la tro ly ban hang cua TechStore. "
            "Chi duoc dua tren du lieu duoc cung cap va phai tra loi bang JSON hop le.\n"
            f"San pham lien quan: {json.dumps(compact_products, ensure_ascii=False)}\n"
            f"Chinh sach cua cua hang: {policy}\n"
            f"Cau hoi cua khach: {query}\n"
            "Tra ve dung schema sau:\n"
            "{\n"
            '  "answer": "cau tra loi ngan gon, huu ich, bang tieng Viet",\n'
            '  "suggested_products": [{"id": 1, "name": "ten", "price": 1000000.0}]\n'
            "}\n"
            "Chi dua ra san pham con hang, khong bịa thong tin ngoai du lieu."
        )

    def _parse_json_payload(self, raw_text: str) -> ChatResponse:
        text = raw_text.strip()
        if text.startswith("```"):
            start = text.find("{")
            end = text.rfind("}") + 1
            if start >= 0 and end > start:
                text = text[start:end]
        payload_json: Any = json.loads(text)
        return ChatResponse(**payload_json)

    def _chat_with_groq(self, prompt: str) -> ChatResponse:
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3,
            "max_tokens": 800,
            "top_p": 0.95,
        }
        for attempt in range(self.max_retries + 1):
            try:
                response = requests.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=self.timeout_seconds,
                )
                response.raise_for_status()
                result = response.json()
                text = result["choices"][0]["message"]["content"].strip()
                return self._parse_json_payload(text)
            except Exception as exc:
                logger.warning("Groq call failed on attempt %d: %s", attempt + 1, exc)
                if attempt >= self.max_retries:
                    raise
        raise ValueError("Groq call failed")

    def _chat_with_gemini(self, prompt: str) -> ChatResponse:
        import google.generativeai as genai

        genai.configure(api_key=self.gemini_api_key)
        generation_config = {
            "temperature": 0.3,
            "response_mime_type": "application/json",
        }
        candidate_models = list(dict.fromkeys([model_name for model_name in self.gemini_models if model_name]))
        last_error: Exception | None = None
        for model_name in candidate_models:
            model = genai.GenerativeModel(model_name)
            for attempt in range(self.max_retries + 1):
                try:
                    response = model.generate_content(prompt, generation_config=generation_config)
                    text = response.text or ""
                    self.model = model_name
                    return self._parse_json_payload(text)
                except Exception as exc:
                    last_error = exc
                    logger.warning(
                        "Gemini call failed with model=%s attempt=%d: %s",
                        model_name,
                        attempt + 1,
                        exc,
                    )
                    if attempt >= self.max_retries:
                        break
        if last_error is not None:
            raise last_error
        raise ValueError("Gemini call failed")

    def chat_with_rag(self, query: str, products: list[dict], policy: str) -> ChatResponse:
        prompt = self._build_prompt(query, products, policy)
        if self.provider == "gemini":
            return self._chat_with_gemini(prompt)
        return self._chat_with_groq(prompt)
