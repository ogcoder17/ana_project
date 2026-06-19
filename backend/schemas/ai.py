from typing import Optional
from pydantic import BaseModel


class AiRecommendRequest(BaseModel):
    product_title: str
    listed_price: float
    buyer_budget: float
    current_seller_offer: float
    strategy: str = "balanced"   # aggressive / balanced / conservative
    role: str = "buyer"          # buyer / seller


class AiRecommendResponse(BaseModel):
    suggested_price: float
    reasoning: str
    buyer_message: str
    seller_message: str
    strategy: str
    role: str


class AnalyticsSummaryResponse(BaseModel):
    total_negotiations: int
    agreed_count: int
    rejected_count: int
    cancelled_count: int
    avg_listed_price: float
    avg_final_price: float
    avg_savings: float
    success_rate: float