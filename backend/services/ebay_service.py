import os
import requests
from dataclasses import dataclass, asdict
from typing import List, Optional
from dotenv import load_dotenv

from services.ebay_auth_service import get_ebay_access_token

load_dotenv()

EBAY_ENV = os.getenv("EBAY_ENV", "sandbox").lower()
EBAY_MARKETPLACE_ID = os.getenv("EBAY_MARKETPLACE_ID", "EBAY_IN")


def _get_browse_base_url():
    if EBAY_ENV == "production":
        return "https://api.ebay.com/buy/browse/v1"
    return "https://api.sandbox.ebay.com/buy/browse/v1"


@dataclass
class RealDeal:
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
    source: str = "ebay"


class EbayDealFinder:
    def search(self, query: str, budget: Optional[int] = None, limit: int = 12) -> List[RealDeal]:
        token = get_ebay_access_token()

        headers = {
            "Authorization": f"Bearer {token}",
            "X-EBAY-C-MARKETPLACE-ID": EBAY_MARKETPLACE_ID,
            "Accept": "application/json",
        }

        params = {
            "q": query,
            "limit": limit,
        }

        response = requests.get(
            f"{_get_browse_base_url()}/item_summary/search",
            headers=headers,
            params=params,
            timeout=30,
        )
        response.raise_for_status()
        payload = response.json()

        items = payload.get("itemSummaries", [])
        deals: List[RealDeal] = []

        for item in items:
            price_obj = item.get("price", {}) or {}
            seller_obj = item.get("seller", {}) or {}
            image_obj = item.get("image", {}) or {}

            title = item.get("title", "Unknown Product")
            item_id = item.get("itemId", "")
            price = float(price_obj.get("value", 0))
            currency = price_obj.get("currency", "INR")

            shipping_options = item.get("shippingOptions", []) or []
            shipping_text = None
            if shipping_options:
                shipping_text = shipping_options[0].get("shippingCostType") or "Shipping info available"

            highlights = []
            if item.get("condition"):
                highlights.append(item["condition"])
            if seller_obj.get("username"):
                highlights.append(f"Seller: {seller_obj['username']}")
            if shipping_text:
                highlights.append(shipping_text)

            deals.append(
                RealDeal(
                    deal_id=item_id or title,
                    title=title,
                    category="General",
                    brand=None,
                    model=None,
                    seller=seller_obj.get("username", "eBay Seller"),
                    price=price,
                    currency=currency,
                    url=item.get("itemWebUrl", ""),
                    image_url=image_obj.get("imageUrl"),
                    condition=item.get("condition"),
                    shipping=shipping_text,
                    highlights=" • ".join(highlights) if highlights else "Real eBay listing",
                )
            )

        if budget is not None:
            deals.sort(key=lambda d: abs(d.price - budget))

        return deals