from fastapi import APIRouter, Depends
from utils.deps import get_current_user
from services.ai_strategy_service import (
    get_buyer_strategy,
    get_seller_strategy,
    build_negotiation_summary,
)

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/strategy")
def get_strategy(payload: dict, current_user=Depends(get_current_user)):
    listed_price = float(payload.get("listed_price", 0))
    budget = float(payload.get("budget", listed_price))
    buyer_strategy = payload.get("buyer_strategy", "balanced")
    seller_strategy = payload.get("seller_strategy", "balanced")

    return {
        "buyer": get_buyer_strategy(buyer_strategy, budget, listed_price),
        "seller": get_seller_strategy(seller_strategy, listed_price),
    }


@router.post("/summary")
def get_summary(payload: dict, current_user=Depends(get_current_user)):
    return build_negotiation_summary(
        rounds=payload.get("rounds", []),
        listed_price=payload.get("listed_price", 0),
        final_price=payload.get("final_price"),
        status=payload.get("status", "IN_PROGRESS"),
    )