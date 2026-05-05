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
    query: str = Field(min_length=1)
    user_id: int | None = 1


class SuggestedProduct(BaseModel):
    id: int
    name: str
    price: float


class ChatResponse(BaseModel):
    answer: str
    suggested_products: list[SuggestedProduct]
