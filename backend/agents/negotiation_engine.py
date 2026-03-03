# backend/agents/negotiation_engine.py
import uuid
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional

@dataclass
class RoundLog:
    round_no: int
    buyer_offer: int
    seller_offer: int
    seller_action: str  # ACCEPT / COUNTER
    note: str

class NegotiationSession:
    def __init__(self, buyer_agent, seller_agent, listed_price: int, max_rounds: int = 6):
        self.session_id = str(uuid.uuid4())
        self.buyer = buyer_agent
        self.seller = seller_agent
        self.listed_price = listed_price
        self.max_rounds = max_rounds
        self.rounds: List[RoundLog] = []
        self.status = "IN_PROGRESS"  # IN_PROGRESS / AGREED / CANCELLED / FAILED
        self.agreed_price: Optional[int] = None
        self.last_seller_offer: Optional[int] = None

    def start(self) -> Dict:
        seller_offer = self.seller.opening_offer()
        buyer_offer = self.buyer.first_offer(self.listed_price)
        action, next_offer = self.seller.respond(buyer_offer)

        self.last_seller_offer = next_offer
        self.rounds.append(RoundLog(
            round_no=1,
            buyer_offer=buyer_offer,
            seller_offer=next_offer,
            seller_action=action,
            note="Opening round"
        ))

        if action == "ACCEPT":
            self.status = "AGREED"
            self.agreed_price = buyer_offer

        return self.to_response()

    def step(self, user_action: str, user_counter: Optional[int] = None) -> Dict:
        if self.status != "IN_PROGRESS":
            return self.to_response()

        if user_action == "CANCEL":
            self.status = "CANCELLED"
            return self.to_response()

        # user says accept seller offer
        if user_action == "ACCEPT":
            self.status = "AGREED"
            self.agreed_price = self.last_seller_offer
            return self.to_response()

        # user counters with a number (or buyer agent generates)
        if user_action == "COUNTER":
            buyer_offer = user_counter if user_counter is not None else self.buyer.counter(self.last_seller_offer)
        else:
            buyer_offer = self.buyer.counter(self.last_seller_offer)

        round_no = len(self.rounds) + 1
        if round_no > self.max_rounds:
            self.status = "FAILED"
            return self.to_response()

        action, next_offer = self.seller.respond(buyer_offer)
        self.last_seller_offer = next_offer

        self.rounds.append(RoundLog(
            round_no=round_no,
            buyer_offer=buyer_offer,
            seller_offer=next_offer,
            seller_action=action,
            note="Negotiation step"
        ))

        if action == "ACCEPT":
            self.status = "AGREED"
            self.agreed_price = buyer_offer

        if len(self.rounds) >= self.max_rounds and self.status == "IN_PROGRESS":
            self.status = "FAILED"

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


# In-memory store (good for demo)
SESSIONS: Dict[str, NegotiationSession] = {}