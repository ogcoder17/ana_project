# backend/agents/seller_agent.py
from dataclasses import dataclass

@dataclass
class SellerPolicy:
    floor_price: int              # minimum acceptable
    concede_step: int = 250       # minimum concession per round
    midpoint_weight: float = 0.5  # 0.5 = midpoint, 0.7 = seller harder stance

class SellerAgent:
    def __init__(self, seller_name: str, deal_price: int, policy: SellerPolicy):
        self.seller_name = seller_name
        self.listed_price = deal_price          # treat deal_price as listed/ask price
        self.policy = policy
        self.current_offer = deal_price         # ✅ start at listed price (not above)

    def opening_offer(self) -> int:
        return self.current_offer

    def respond(self, buyer_offer: int) -> tuple[str, int]:
        # ✅ If buyer meets current offer, accept
        if buyer_offer >= self.current_offer:
            return "ACCEPT", buyer_offer

        # ✅ If buyer reaches floor, and gap is small, accept
        if buyer_offer >= self.policy.floor_price and (self.current_offer - buyer_offer) <= self.policy.concede_step:
            return "ACCEPT", buyer_offer

        # ✅ Otherwise counter: move towards buyer offer, but never below floor
        # weighted midpoint between current offer and buyer offer
        proposed = int(self.policy.midpoint_weight * self.current_offer + (1 - self.policy.midpoint_weight) * buyer_offer)

        # ensure seller actually concedes at least concede_step (if possible)
        proposed = min(proposed, self.current_offer - self.policy.concede_step)

        # enforce rational bounds
        proposed = max(self.policy.floor_price, proposed)     # not below floor
        proposed = min(self.listed_price, proposed)           # ✅ never above listed
        proposed = min(self.current_offer, proposed)          # ✅ never increase

        self.current_offer = proposed
        return "COUNTER", self.current_offer