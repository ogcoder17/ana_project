from dataclasses import dataclass
from typing import List, Optional

import requests

USD_TO_INR = 83.0  # demo conversion rate


@dataclass
class DummyDeal:
    deal_id: str
    title: str
    category: str
    brand: Optional[str]
    model: Optional[str]
    seller: str
    price: float
    currency: str
    url: str
    image_url: Optional[str]
    condition: Optional[str]
    shipping: Optional[str]
    highlights: str
    source: str = "dummyjson"


class DummyJsonDealFinder:
    BASE_URL = "https://dummyjson.com/products/search"

    def search(self, query: str, budget: Optional[int] = None, limit: int = 12) -> List[DummyDeal]:
        response = requests.get(self.BASE_URL, params={"q": query}, timeout=30)
        response.raise_for_status()

        products = response.json().get("products", [])
        deals: List[DummyDeal] = []

        for p in products[:limit]:
            usd_price = float(p.get("price", 0))
            inr_price = round(usd_price * USD_TO_INR, 2)

            title = p.get("title", "Unknown Product")
            category = p.get("category", "General")
            brand = p.get("brand")
            image_url = p.get("thumbnail") or (p.get("images")[0] if p.get("images") else None)

            shipping = p.get("shippingInformation")
            availability = p.get("availabilityStatus")
            rating = p.get("rating")
            warranty = p.get("warrantyInformation")

            highlights_parts = []
            if availability:
                highlights_parts.append(availability)
            if shipping:
                highlights_parts.append(shipping)
            if warranty:
                highlights_parts.append(warranty)
            if rating is not None:
                highlights_parts.append(f"Rating {rating}")

            deals.append(
                DummyDeal(
                    deal_id=str(p.get("id")),
                    title=title,
                    category=category,
                    brand=brand,
                    model=title,
                    seller=f"{brand or 'Generic'} Store",
                    price=inr_price,
                    currency="INR",
                    url=f"https://dummyjson.com/products/{p.get('id')}",
                    image_url=image_url,
                    condition="New",
                    shipping=shipping,
                    highlights=" • ".join(highlights_parts) if highlights_parts else p.get("description", "Sample product"),
                )
            )

        if budget is not None:
            deals.sort(key=lambda d: abs(d.price - float(budget)))

        return deals