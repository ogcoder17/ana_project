# backend/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware


from services.deal_finder import MockDealFinder
from agents.buyer_agent import BuyerAgent
from agents.seller_agent import SellerAgent, SellerPolicy
from agents.negotiation_engine import NegotiationSession, SESSIONS

app = FastAPI(title="ANA - Autonomous Negotiation Agent")

deal_finder = MockDealFinder()

class DealSearchRequest(BaseModel):
    brand: str
    model: str
    budget: int

class DealOut(BaseModel):
    deal_id: str
    brand: str
    model: str
    seller: str
    price: int
    url: str
    highlights: str

class StartNegotiationRequest(BaseModel):
    deal_id: str
    brand: str
    model: str
    seller: str
    listed_price: int
    budget: int

class NegotiateStepRequest(BaseModel):
    action: str  # ACCEPT / COUNTER / CANCEL
    counter_price: Optional[int] = None

@app.post("/search-deals", response_model=List[DealOut])
def search_deals(req: DealSearchRequest):
    deals = deal_finder.search(req.brand, req.model, req.budget, limit=8)
    return [DealOut(**d.__dict__) for d in deals]

@app.post("/start-negotiation")
def start_negotiation(req: StartNegotiationRequest):
    buyer = BuyerAgent(budget=req.budget, target_discount=500)

    # Seller policy: floor price is 90% of listed price (demo logic)
    floor = int(req.listed_price * 0.90)
    seller = SellerAgent(
        seller_name=req.seller,
        deal_price=req.listed_price,
        policy=SellerPolicy(floor_price=floor, concede_step=250, midpoint_weight=0.6)
    )

    session = NegotiationSession(buyer, seller, listed_price=req.listed_price, max_rounds=6)
    SESSIONS[session.session_id] = session
    return session.start()

@app.post("/negotiate/{session_id}")
def negotiate_step(session_id: str, req: NegotiateStepRequest):
    session = SESSIONS.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    action = req.action.strip().upper()
    if action not in {"ACCEPT", "COUNTER", "CANCEL"}:
        raise HTTPException(status_code=400, detail="Invalid action. Use ACCEPT/COUNTER/CANCEL.")

    return session.step(user_action=action, user_counter=req.counter_price)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)