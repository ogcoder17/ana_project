from typing import List
from sqlalchemy.orm import Session

from services.dummyjson_service import DummyJsonDealFinder
from models.seller_product import SellerProduct
from models.user import User


class MarketplaceSearchService:
    def __init__(self):
        self.dummy_finder = DummyJsonDealFinder()

    def search(self, db: Session, query: str, budget=None, limit: int = 12) -> List[dict]:
        seller_rows = (
            db.query(SellerProduct, User)
            .join(User, SellerProduct.seller_user_id == User.id)
            .filter(SellerProduct.status == "Active")
            .filter(SellerProduct.title.ilike(f"%{query}%"))
            .order_by(SellerProduct.created_at.desc())
            .limit(limit)
            .all()
        )

        internal_results = []
        for p, seller in seller_rows:
            internal_results.append(
                {
                    "deal_id": f"seller-{p.id}",
                    "title": p.title,
                    "category": p.category,
                    "brand": p.brand,
                    "model": p.title,
                    "seller": seller.name,
                    "seller_user_id": seller.id,
                    "price": float(p.price),
                    "currency": p.currency,
                    "url": f"http://127.0.0.1:8000/seller-products/{p.id}",
                    "image_url": p.image_url,
                    "condition": "New",
                    "shipping": "Seller managed shipping",
                    "highlights": p.description or f"{p.category} • Listed by {seller.name}",
                    "source": "seller-platform",
                }
            )

        external_results = []
        try:
            for d in self.dummy_finder.search(query=query, budget=budget, limit=limit):
                row = d.__dict__.copy()
                row["seller_user_id"] = None
                external_results.append(row)
        except Exception as e:
            print("DUMMYJSON FALLBACK ERROR:", repr(e))
            external_results = []

        combined = internal_results + external_results

        if budget is not None:
            combined.sort(key=lambda d: abs(float(d["price"]) - float(budget)))

        return combined[:limit]