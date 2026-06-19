from typing import Optional
from pydantic import BaseModel


class StartDbNegotiationRequest(BaseModel):
    product_offer_id: int
    budget: float
    starting_offer: Optional[float] = None


class NegotiationStepRequest(BaseModel):
    action: str
    counter_price: Optional[float] = None


class SellerNegotiationActionRequest(BaseModel):
    action: str  # ACCEPT / COUNTER / REJECT
    counter_price: Optional[float] = None


class NegotiationHistoryItem(BaseModel):
    negotiation_id: int
    product_title: str
    seller_name: Optional[str]
    listed_price: float
    final_price: Optional[float]
    status: str
    started_at: Optional[str]