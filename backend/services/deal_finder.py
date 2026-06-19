from dataclasses import dataclass
from typing import List
import random


@dataclass
class Deal:
    deal_id: str
    brand: str
    model: str
    seller: str
    price: int
    url: str
    highlights: str


class MockDealFinder:
    SELLERS = ["ABC Official Store", "PhoneHub", "BestMobiles", "MegaMart", "LocalRetailer"]
    HIGHLIGHTS = [
        "1-year warranty • Free delivery",
        "Bank offer available • 7-day return",
        "Exchange bonus eligible",
        "No-cost EMI available",
        "Fast delivery • COD available"
    ]

    def search(self, brand: str, model: str, budget: int, limit: int = 8) -> List[Deal]:
        low = max(1000, int(budget * 0.8))
        high = int(budget * 1.2)

        deals = []
        for i in range(limit):
            price = random.randint(low, high)
            seller = random.choice(self.SELLERS)
            deals.append(
                Deal(
                    deal_id=f"D{i+1}",
                    brand=brand,
                    model=model,
                    seller=seller,
                    price=price,
                    url=f"https://example.com/{brand}-{model}-{i+1}".replace(" ", "-").lower(),
                    highlights=random.choice(self.HIGHLIGHTS),
                )
            )

        deals.sort(key=lambda d: abs(d.price - budget))
        return deals