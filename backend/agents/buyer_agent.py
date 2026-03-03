# backend/agents/buyer_agent.py
class BuyerAgent:
    def __init__(self, budget: int, target_discount: int = 500):
        self.budget = budget
        self.target_discount = target_discount  # buyer tries to get at least this much off

    def first_offer(self, listed_price: int) -> int:
        # Start below budget and below list price
        offer = min(self.budget, listed_price) - self.target_discount
        return max(1, offer)

    def counter(self, seller_offer: int) -> int:
        # Move halfway from current budget boundary towards seller offer
        # but never exceed budget
        return min(self.budget, int((seller_offer + self.budget) / 2))