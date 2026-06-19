from statistics import mean


def get_buyer_strategy(strategy: str, budget: float, listed_price: float):
    strategy = (strategy or "balanced").lower()

    if strategy == "aggressive":
        first_offer = min(budget, listed_price * 0.88)
        concession_step = max(100, listed_price * 0.015)
        tone = "firm"
    elif strategy == "conservative":
        first_offer = min(budget, listed_price * 0.95)
        concession_step = max(75, listed_price * 0.01)
        tone = "polite"
    else:
        first_offer = min(budget, listed_price * 0.92)
        concession_step = max(90, listed_price * 0.012)
        tone = "balanced"

    return {
        "strategy": strategy,
        "first_offer": round(first_offer, 2),
        "concession_step": round(concession_step, 2),
        "tone": tone,
    }


def get_seller_strategy(strategy: str, listed_price: float):
    strategy = (strategy or "balanced").lower()

    if strategy == "strict":
        floor_ratio = 0.95
        concession_step = max(80, listed_price * 0.008)
        tone = "firm"
    elif strategy == "discount-heavy":
        floor_ratio = 0.87
        concession_step = max(120, listed_price * 0.018)
        tone = "friendly"
    else:
        floor_ratio = 0.90
        concession_step = max(100, listed_price * 0.012)
        tone = "balanced"

    return {
        "strategy": strategy,
        "floor_price": round(listed_price * floor_ratio, 2),
        "concession_step": round(concession_step, 2),
        "tone": tone,
    }


def build_negotiation_summary(rounds, listed_price, final_price, status):
    if not rounds:
        return {
            "summary": "No negotiation rounds were recorded.",
            "buyer_avg_offer": None,
            "seller_avg_offer": None,
            "savings": None,
        }

    buyer_offers = [float(r["buyer_offer"]) for r in rounds if r.get("buyer_offer") is not None]
    seller_offers = [float(r["seller_offer"]) for r in rounds if r.get("seller_offer") is not None]

    buyer_avg = round(mean(buyer_offers), 2) if buyer_offers else None
    seller_avg = round(mean(seller_offers), 2) if seller_offers else None
    savings = round(float(listed_price) - float(final_price), 2) if final_price is not None else None

    return {
        "summary": f"Status: {status}. Final price: {final_price}. Savings: {savings}.",
        "buyer_avg_offer": buyer_avg,
        "seller_avg_offer": seller_avg,
        "savings": savings,
    }