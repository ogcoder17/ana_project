def get_strategy_multiplier(strategy: str):
    strategy = (strategy or "balanced").lower()

    if strategy == "aggressive":
        return {
            "buyer_discount_pct": 0.12,
            "seller_counter_buffer_pct": 0.08,
        }
    elif strategy == "conservative":
        return {
            "buyer_discount_pct": 0.04,
            "seller_counter_buffer_pct": 0.03,
        }

    return {
        "buyer_discount_pct": 0.08,
        "seller_counter_buffer_pct": 0.05,
    }


def heuristic_recommendation(
    listed_price: float,
    buyer_budget: float,
    current_seller_offer: float,
    strategy: str,
    role: str,
):
    cfg = get_strategy_multiplier(strategy)

    if role == "buyer":
        base_target = min(listed_price, buyer_budget)
        discount = base_target * cfg["buyer_discount_pct"]
        suggested = max(1, round(base_target - discount))

        if current_seller_offer < suggested:
            suggested = round(current_seller_offer)

        reasoning = (
            f"As a {strategy} buyer, the system recommends negotiating below the "
            f"seller offer while staying realistic relative to your budget."
        )

        buyer_message = (
            f"Based on your {strategy} strategy, I suggest countering at ₹{suggested}. "
            f"This keeps the offer competitive without dropping too low."
        )

        seller_message = (
            f"The buyer is likely aiming for approximately ₹{suggested} based on "
            f"their budget and current negotiation pattern."
        )

        return suggested, reasoning, buyer_message, seller_message

    # seller side
    buffer_amt = current_seller_offer * cfg["seller_counter_buffer_pct"]
    suggested = round(max(buyer_budget, current_seller_offer - buffer_amt))

    reasoning = (
        f"As a {strategy} seller, the system recommends a controlled concession "
        f"to improve the chance of closing without reducing too aggressively."
    )

    buyer_message = (
        f"The seller is likely to counter near ₹{suggested} to maintain margin "
        f"while moving the deal forward."
    )

    seller_message = (
        f"I recommend responding at ₹{suggested}. This matches a {strategy} "
        f"seller stance while preserving value."
    )

    return suggested, reasoning, buyer_message, seller_message