from typing import Optional
from pydantic import BaseModel


class SellerProductCreateRequest(BaseModel):
    title: str
    category: str = "General"
    brand: Optional[str] = None
    description: Optional[str] = None
    price: float
    currency: str = "INR"
    image_url: Optional[str] = None
    status: str = "Active"


class SellerProductOut(BaseModel):
    id: int
    title: str
    category: str
    brand: Optional[str] = None
    description: Optional[str] = None
    price: float
    currency: str
    image_url: Optional[str] = None
    status: str