from pydantic import BaseModel, Field


class Product(BaseModel):
    id: int
    name: str
    description: str
    brand: str
    category: str
    price: float
    stock: int
    image_url: str


class RecommendItem(BaseModel):
    id: int
    name: str
    price: float
    score: float


class ChatRequest(BaseModel):
    query: str = Field(min_length=1, max_length=500, description="User query for AI assistant")
    user_id: int | None = Field(default=1, ge=1, description="User ID (optional)")


class SuggestedProduct(BaseModel):
    id: int
    name: str
    price: float


class ChatResponse(BaseModel):
    answer: str = Field(min_length=1, description="Natural language answer from AI")
    suggested_products: list[SuggestedProduct] = Field(default_factory=list, description="Recommended products")
