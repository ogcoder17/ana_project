from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from utils.deps import get_db, get_current_user
from models.negotiation import Negotiation
from models.product import ProductOffer, Product
from models.user import User
from schemas.negotiation import StartDbNegotiationRequest
from services.negotiation_service import (
    start_db_negotiation,
    get_negotiation_payload,
    buyer_decision,
    renegotiate,
)

router = APIRouter(prefix="/db-negotiations", tags=["db-negotiations"])


@router.post("/start")
def start_negotiation(
    payload: StartDbNegotiationRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return start_db_negotiation(
            db=db,
            buyer_user_id=current_user.id,
            product_offer_id=payload.product_offer_id,
            budget=payload.budget,
            starting_offer=payload.starting_offer,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Start negotiation failed: {str(e)}")


@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        rows = (
            db.query(Negotiation)
            .filter(Negotiation.buyer_user_id == current_user.id)
            .order_by(Negotiation.started_at.desc())
            .all()
        )

        result = []
        for n in rows:
            offer = db.query(ProductOffer).filter(ProductOffer.id == n.product_offer_id).first()
            title = "Unknown Product"
            seller_name = "Unknown Seller"
            seller_email = None

            if offer:
                seller_name = offer.seller_name or "Seller"

                product = db.query(Product).filter(Product.id == offer.product_id).first()
                if product:
                    title = product.title

                if n.seller_user_id:
                    seller_user = db.query(User).filter(User.id == n.seller_user_id).first()
                    if seller_user:
                        seller_name = seller_user.name
                        seller_email = seller_user.email

            row = {
                "negotiation_id": n.id,
                "product_title": title,
                "seller_name": seller_name,
                "listed_price": float(n.listed_price),
                "final_price": float(n.final_price) if n.final_price is not None else None,
                "status": n.status,
                "buyer_approved": n.buyer_approved,
                "seller_approved": n.seller_approved,
                "started_at": n.started_at.isoformat() if n.started_at else None,
                "contact": None,
            }

            if n.status == "APPROVED":
                row["contact"] = {
                    "name": seller_name,
                    "email": seller_email,
                }

            result.append(row)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"History failed: {str(e)}")

@router.get("/{negotiation_id}")
def get_negotiation(
    negotiation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return get_negotiation_payload(db, negotiation_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{negotiation_id}/buyer-decision")
def buyer_action(
    negotiation_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return buyer_decision(
            db=db,
            negotiation_id=negotiation_id,
            buyer_user_id=current_user.id,
            action=payload.get("action", ""),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Buyer decision failed: {str(e)}")


@router.post("/{negotiation_id}/renegotiate")
def rerun_negotiation(
    negotiation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        return renegotiate(db, negotiation_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Re-negotiation failed: {str(e)}")