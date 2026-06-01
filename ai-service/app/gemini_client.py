from __future__ import annotations

import json
import logging
import os
from typing import Any

import requests

from app.models import ChatResponse

logger = logging.getLogger("ai-service")


class GeminiClient:
    """Groq client for LLM requests (using Mixtral-8x7b or other models)."""
    
    def __init__(self) -> None:
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            raise RuntimeError("Missing GROQ_API_KEY")
        
        self.api_key = api_key
        self.base_url = "https://api.groq.com/openai/v1"
        self.model = "llama-3.1-8b-instant"  # Free model on Groq
        self.timeout_seconds = 30
        self.max_retries = 2
        
        logger.info("Groq client initialized with model: %s", self.model)

    def chat_with_rag(self, query: str, products: list[dict], policy: str) -> ChatResponse:
        """Call OpenRouter API with RAG context, retry on failure, validate response."""
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
            '  "suggested_products": [{"id": 1, "name": "ten san pham", "price": 100000.0}]\n'
            "}\n"
            "Luu y: Chi goi y san pham co stock > 0. Khong bia gia, khong bia san pham."
        )

        for attempt in range(self.max_retries + 1):
            try:
                logger.info("Calling Groq API (attempt %d/%d)", attempt + 1, self.max_retries + 1)
                
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                }
                
                payload = {
                    "model": self.model,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ],
                    "temperature": 0.3,
                    "max_tokens": 1000,
                    "top_p": 0.95,
                }
                
                response = requests.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=self.timeout_seconds,
                )
                
                try:
                    response.raise_for_status()
                except requests.exceptions.HTTPError as exc:
                    logger.error("Groq API error on attempt %d: Status=%s | Body: %s", attempt + 1, response.status_code, response.text)
                    if attempt < self.max_retries:
                        continue
                    raise ValueError(f"Groq API error: {exc}") from exc
                
                result = response.json()
                
                # Extract text from Groq response
                if "choices" not in result or not result["choices"]:
                    raise ValueError("No choices in Groq response")
                
                text = result["choices"][0]["message"]["content"].strip()
                logger.info("Groq response: %s", text[:200])
                
                # Extract JSON from code blocks if wrapped
                if text.startswith("```"):
                    # Extract from code blocks (```json ... ```)
                    start = text.find("{")
                    end = text.rfind("}") + 1
                    if start >= 0 and end > start:
                        text = text[start:end]
                        logger.info("Extracted JSON from code blocks")
                
                logger.debug("Attempting to parse: %s", text[:100])
                payload_json: Any = json.loads(text)
                validated = ChatResponse(**payload_json)
                logger.info("Groq response validated successfully")
                return validated
                
            except json.JSONDecodeError as exc:
                logger.error("JSON parse error on attempt %d: %s", attempt + 1, exc)
                if attempt < self.max_retries:
                    continue
                raise ValueError(f"Invalid JSON from Groq: {exc}") from exc
                
            except requests.exceptions.Timeout:
                logger.warning("Groq request timeout on attempt %d", attempt + 1)
                if attempt < self.max_retries:
                    continue
                raise TimeoutError(f"Groq API timeout after {self.timeout_seconds}s")
                
            except requests.exceptions.RequestException as exc:
                response_text = ""
                if hasattr(exc, 'response') and exc.response is not None:
                    response_text = exc.response.text
                logger.error("Groq API error on attempt %d: %s | Response: %s", attempt + 1, exc, response_text)
                if attempt < self.max_retries:
                    continue
                raise ValueError(f"Groq API error: {exc}") from exc
        
        # Should not reach here
        raise ValueError("Failed to get valid response from Groq after all retries")
