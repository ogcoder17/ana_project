from dataclasses import dataclass
from typing import List, Optional
from urllib.parse import quote_plus

import requests
from bs4 import BeautifulSoup


@dataclass
class ScrapedDeal:
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
    source: str = "web-scrape"


class WebScrapeDealFinder:
    def __init__(self):
        self.base_url = "https://www.ebay.com/sch/i.html?_nkw="
        self.headers = {
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "en-US,en;q=0.9",
        }

    def _parse_price(self, raw: str) -> float:
        if not raw:
            return 0.0

        cleaned = (
            raw.replace("US $", "")
            .replace("$", "")
            .replace("₹", "")
            .replace(",", "")
            .strip()
        )

        if " to " in cleaned:
            cleaned = cleaned.split(" to ")[0].strip()

        try:
            return float(cleaned)
        except Exception:
            return 0.0

    def search(self, query: str, budget: Optional[int] = None, limit: int = 12) -> List[ScrapedDeal]:
        search_url = f"{self.base_url}{quote_plus(query)}"
        print("SCRAPING URL:", search_url)

        resp = requests.get(search_url, headers=self.headers, timeout=30)
        resp.raise_for_status()

        html = resp.text
        print("HTML LENGTH:", len(html))

        soup = BeautifulSoup(html, "lxml")

        # eBay search cards
        items = soup.select("li.s-item")
        print("RAW ITEM COUNT:", len(items))

        deals: List[ScrapedDeal] = []

        for idx, item in enumerate(items):
            if len(deals) >= limit:
                break

            title_el = item.select_one(".s-item__title")
            price_el = item.select_one(".s-item__price")
            link_el = item.select_one("a.s-item__link")
            image_el = item.select_one(".s-item__image-img")
            condition_el = item.select_one(".SECONDARY_INFO")
            shipping_el = item.select_one(".s-item__shipping, .s-item__logisticsCost, .s-item__dynamic")
            subtitle_el = item.select_one(".s-item__subtitle")
            seller_el = item.select_one(".s-item__seller-info-text")

            title = title_el.get_text(" ", strip=True) if title_el else ""
            price_text = price_el.get_text(" ", strip=True) if price_el else ""
            link = link_el.get("href") if link_el else ""
            image_url = image_el.get("src") if image_el else None
            condition = condition_el.get_text(" ", strip=True) if condition_el else None
            shipping = shipping_el.get_text(" ", strip=True) if shipping_el else None
            subtitle = subtitle_el.get_text(" ", strip=True) if subtitle_el else None
            seller = seller_el.get_text(" ", strip=True) if seller_el else "eBay Marketplace"

            # skip placeholders/ads/bad cards
            if not title or title.lower() in {
                "shop on ebay",
                "results matching fewer words",
                "shop by category",
            }:
                continue

            if not link:
                continue

            price = self._parse_price(price_text)
            if price <= 0:
                continue

            highlights = []
            if condition:
                highlights.append(condition)
            if shipping:
                highlights.append(shipping)
            if subtitle:
                highlights.append(subtitle)

            deals.append(
                ScrapedDeal(
                    deal_id=f"scrape-{idx+1}-{abs(hash(link))}",
                    title=title,
                    category="General",
                    brand=None,
                    model=None,
                    seller=seller,
                    price=price,
                    currency="USD",
                    url=link,
                    image_url=image_url,
                    condition=condition,
                    shipping=shipping,
                    highlights=" • ".join(highlights) if highlights else "Live web result",
                )
            )

        print("PARSED DEAL COUNT:", len(deals))

        if budget is not None:
            deals.sort(key=lambda d: abs(d.price - float(budget)))

        return deals