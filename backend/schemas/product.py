from typing import Optional
from pydantic import BaseModel


class SaveOfferRequest(BaseModel):
    title: str
    category: str = "General"
    brand: Optional[str] = None
    model: Optional[str] = None
    seller_user_id: Optional[int] = None
    source_name: str
    source_product_id: Optional[str] = None
    seller_name: str
    listed_price: float
    currency: str
    product_url: Optional[str] = None
    image_url: Optional[str] = None
    stock_status: Optional[str] = None
    condition: Optional[str] = None
    shipping: Optional[str] = None
    highlights: Optional[str] = None


class SaveOfferResponse(BaseModel):
    product_id: int
    product_offer_id: int
    message: str