import uuid
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional

SESSIONS = {}


@dataclass
class RoundLog:
    round_no: int
    buyer_offer: int
    seller_offer: int
    seller_action: str
    note: str


class NegotiationSession:
    def __init__(self, buyer_agent, seller_agent, listed_price: int, max_rounds: int = 6):
        self.session_id = str(uuid.uuid4())
        self.buyer = buyer_agent
        self.seller = seller_agent
        self.listed_price = int(listed_price)
        self.max_rounds = max_rounds
        self.rounds: List[RoundLog] = []
        self.status = "IN_PROGRESS"
        self.agreed_price: Optional[int] = None
        self.last_seller_offer: Optional[int] = None

    def start(self) -> Dict:
        buyer_offer = self.buyer.first_offer(self.listed_price)
        action, next_offer = self.seller.respond(buyer_offer)

        self.last_seller_offer = next_offer
        self.rounds.append(
            RoundLog(
                round_no=1,
                buyer_offer=buyer_offer,
                seller_offer=next_offer,
                seller_action=action,
                note="Opening round",
            )
        )

        if action == "ACCEPT":
            self.status = "AGREED"
            self.agreed_price = buyer_offer
        elif self.max_rounds == 1:
            self.status = "FINAL_OFFER"
            self.agreed_price = next_offer

        return self.to_response()

    def step(self, user_action: str, user_counter: Optional[int] = None) -> Dict:
        if self.status != "IN_PROGRESS":
            return self.to_response()

        if user_action == "CANCEL":
            self.status = "CANCELLED"
            return self.to_response()

        if user_action == "ACCEPT":
            self.status = "AGREED"
            self.agreed_price = self.last_seller_offer
            return self.to_response()

        if user_action == "COUNTER":
            buyer_offer = (
                int(user_counter)
                if user_counter is not None
                else self.buyer.counter(self.last_seller_offer, self.listed_price)
            )
        else:
            buyer_offer = self.buyer.counter(self.last_seller_offer, self.listed_price)

        buyer_offer = min(buyer_offer, self.listed_price, self.buyer.budget)

        round_no = len(self.rounds) + 1

        # If this is beyond allowed rounds, convert seller's last offer into final offer
        if round_no > self.max_rounds:
            self.status = "FINAL_OFFER"
            self.agreed_price = self.last_seller_offer
            return self.to_response()

        action, next_offer = self.seller.respond(buyer_offer)
        repeat_count = 0

        for r in reversed(self.rounds):
            if r.seller_offer == next_offer:
                repeat_count += 1
            else:
                break

        repeat_count = 0

        for r in reversed(self.rounds):
            if r.seller_offer == next_offer:
                repeat_count += 1
            else:
                break

        note = "Negotiation step"

        if repeat_count >= 2 and action == "COUNTER":
            note = "⚠️ Seller Agent has reached a firm price and may not go further."

        self.rounds.append(
            RoundLog(
                round_no=round_no,
                buyer_offer=buyer_offer,
                seller_offer=next_offer,
                seller_action=action,
                note=note,
            )
        )

        if action == "ACCEPT":
            self.status = "AGREED"
            self.agreed_price = buyer_offer
            return self.to_response()

        # If seller is still countering at the final allowed round,
        # treat seller's counter as the final offer for buyer approval.
        if round_no >= self.max_rounds:
            self.status = "FINAL_OFFER"
            self.agreed_price = next_offer
            return self.to_response()

        return self.to_response()

    def to_response(self) -> Dict:
        return {
            "session_id": self.session_id,
            "status": self.status,
            "listed_price": self.listed_price,
            "last_seller_offer": self.last_seller_offer,
            "agreed_price": self.agreed_price,
            "rounds": [asdict(r) for r in self.rounds],
        }