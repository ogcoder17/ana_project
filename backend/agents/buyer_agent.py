from dataclasses import dataclass


@dataclass
class BuyerPolicy:
    target_discount: int = 500
    min_step: int = 150
    max_step: int = 400


class BuyerAgent:
    def __init__(self, budget: int, target_discount: int = 500, starting_offer: int = None):
        self.original_budget = int(budget)
        self.starting_offer = int(starting_offer) if starting_offer else None

        # If buyer gives a higher starting offer, treat that as extended willingness
        self.budget = max(
            self.original_budget,
            self.starting_offer or self.original_budget
        )

        self.policy = BuyerPolicy(target_discount=target_discount)
        self.last_offer = None

    def _cap_offer(self, offer: int, listed_price: int) -> int:
        """
        Buyer offer should never exceed listed price or buyer's effective budget.
        Effective budget = max(original budget, starting offer).
        """
        return max(1, min(int(offer), int(self.budget), int(listed_price)))

    def first_offer(self, listed_price: int) -> int:
        listed_price = int(listed_price)

        if self.starting_offer:
            offer = self.starting_offer
        else:
            desired = listed_price - self.policy.target_discount
            minimum_reasonable = int(listed_price * 0.80)
            offer = max(desired, minimum_reasonable)

        offer = self._cap_offer(offer, listed_price)
        self.last_offer = offer
        return offer

    def counter(self, seller_offer: int, listed_price: int) -> int:
        seller_offer = int(seller_offer)
        listed_price = int(listed_price)

        if self.last_offer is None:
            return self.first_offer(listed_price)

        gap = seller_offer - self.last_offer

        if gap <= 0:
            offer = self.last_offer
        else:
            step = max(self.policy.min_step, min(self.policy.max_step, gap // 2))
            offer = self.last_offer + step

        offer = self._cap_offer(offer, listed_price)
        self.last_offer = offer
        return offer