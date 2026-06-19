from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database.session import Base
from database.connection import engine
from routers.auth import router as auth_router
from routers.users import router as users_router

from services.deal_finder import MockDealFinder
from agents.buyer_agent import BuyerAgent
from agents.seller_agent import SellerAgent, SellerPolicy
from agents.negotiation_engine import NegotiationSession, SESSIONS

from services.dummyjson_service import DummyJsonDealFinder
from routers.products import router as products_router
from routers.negotiations import router as db_negotiations_router
from routers.seller import router as seller_router
from routers.ai import router as ai_router
from routers.analytics import router as analytics_router
from routers.uploads import router as uploads_router

from sqlalchemy.orm import Session
from fastapi import Depends
from utils.deps import get_db
from services.marketplace_search_service import MarketplaceSearchService
import models.seller_product
import os
from fastapi.staticfiles import StaticFiles

import models.user
import models.product
import models.negotiation


# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ANA - Autonomous Negotiation Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(products_router)
app.include_router(db_negotiations_router)
app.include_router(seller_router)
app.include_router(ai_router)
app.include_router(analytics_router)
app.include_router(uploads_router)

deal_finder = MockDealFinder()
dummy_finder = DummyJsonDealFinder()
marketplace_search = MarketplaceSearchService()


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
    action: str
    counter_price: Optional[int] = None

class RealDealSearchRequest(BaseModel):
    query: str
    budget: Optional[int] = None
    limit: int = 12


class RealDealOut(BaseModel):
    deal_id: str
    title: str
    category: str
    brand: Optional[str] = None
    model: Optional[str] = None
    seller: str
    seller_user_id: Optional[int] = None
    price: float
    currency: str
    url: str
    image_url: Optional[str] = None
    condition: Optional[str] = None
    shipping: Optional[str] = None
    highlights: str
    source: str


@app.get("/")
def root():
    return {"message": "ANA backend is running"}


@app.post("/search-deals", response_model=List[DealOut])
def search_deals(req: DealSearchRequest):
    deals = deal_finder.search(req.brand, req.model, req.budget, limit=8)
    return [DealOut(**d.__dict__) for d in deals]


@app.post("/start-negotiation")
def start_negotiation(req: StartNegotiationRequest):
    buyer = BuyerAgent(budget=req.budget, target_discount=500)

    floor = int(req.listed_price * 0.90)
    seller = SellerAgent(
        seller_name=req.seller,
        deal_price=req.listed_price,
        policy=SellerPolicy(
            floor_price=floor,
            concede_step=250,
            midpoint_weight=0.6
        )
    )

    session = NegotiationSession(
        buyer,
        seller,
        listed_price=req.listed_price,
        max_rounds=6
    )
    SESSIONS[session.session_id] = session
    return session.start()


@app.post("/negotiate/{session_id}")
def negotiate_step(session_id: str, req: NegotiateStepRequest):
    session = SESSIONS.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    action = req.action.strip().upper()
    if action not in {"ACCEPT", "COUNTER", "CANCEL"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid action. Use ACCEPT/COUNTER/CANCEL."
        )

    return session.step(user_action=action, user_counter=req.counter_price)

@app.post("/search-real-deals", response_model=List[RealDealOut])
def search_real_deals(req: RealDealSearchRequest, db: Session = Depends(get_db)):
    try:
        deals = marketplace_search.search(
            db=db,
            query=req.query,
            budget=req.budget,
            limit=req.limit
        )
        return [RealDealOut(**deal) for deal in deals]
    except Exception as e:
        print("MARKETPLACE SEARCH ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=f"Marketplace search failed: {str(e)}")