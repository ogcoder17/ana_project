from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from utils.deps import get_db, get_current_user
from schemas.seller_product import SellerProductCreateRequest
from services.seller_product_service import create_seller_product, get_seller_products
from services.negotiation_service import seller_decision, renegotiate
from models.user import User
from models.negotiation import Negotiation
from models.product import ProductOffer, Product

router = APIRouter(prefix="/seller", tags=["seller"])


@router.get("/dashboard")
def seller_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Seller access only")

    try:
        products = get_seller_products(db, current_user.id) or []

        total_products = len(products)
        active_products = len([p for p in products if p.status == "Active"])
        revenue = sum(float(p.price) for p in products if p.status == "Active")

        pending_rows = (
            db.query(Negotiation, ProductOffer, Product)
            .join(ProductOffer, Negotiation.product_offer_id == ProductOffer.id)
            .join(Product, ProductOffer.product_id == Product.id)
            .filter(Negotiation.seller_user_id == current_user.id)
            .filter(Negotiation.status == "PENDING_APPROVALS")
            .order_by(Negotiation.started_at.desc())
            .all()
        )

        pending_approvals = []
        for negotiation, offer, product in pending_rows:
            pending_approvals.append({
                "negotiation_id": negotiation.id,
                "title": product.title,
                "buyer_budget": float(negotiation.buyer_budget),
                "listed_price": float(negotiation.listed_price),
                "final_price": float(negotiation.final_price) if negotiation.final_price is not None else None,
                "buyer_approved": bool(negotiation.buyer_approved),
                "seller_approved": bool(negotiation.seller_approved),
            })

        return {
            "total_products": total_products,
            "active_products": active_products,
            "total_negotiations": len(pending_approvals),
            "revenue": round(revenue, 2),
            "products": [
                {
                    "id": p.id,
                    "title": p.title,
                    "price": float(p.price),
                    "status": p.status,
                    "category": p.category,
                    "brand": p.brand,
                    "description": p.description,
                    "image_url": p.image_url,
                    "currency": p.currency,
                }
                for p in products
            ],
            "pending_approvals": pending_approvals,
        }
    except Exception as e:
        print("SELLER DASHBOARD ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=f"Seller dashboard failed: {str(e)}")


@router.post("/products")
def add_seller_product(
    payload: SellerProductCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Seller access only")

    try:
        product = create_seller_product(db, current_user.id, payload)
        return {
            "message": "Seller product created successfully",
            "product": {
                "id": product.id,
                "title": product.title,
                "price": float(product.price),
                "status": product.status,
                "category": product.category,
                "brand": product.brand,
                "description": product.description,
                "image_url": product.image_url,
                "currency": product.currency,
            },
        }
    except Exception as e:
        db.rollback()
        print("SELLER PRODUCT ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=f"Seller product save failed: {str(e)}")


@router.post("/negotiations/{negotiation_id}/decision")
def seller_action(
    negotiation_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Seller access only")

    action = payload.get("action", "").upper()

    try:
        if action == "RENEGOTIATE":
            return renegotiate(db, negotiation_id)

        return seller_decision(
            db=db,
            negotiation_id=negotiation_id,
            seller_user_id=current_user.id,
            action=action,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Seller action failed: {str(e)}")
    
@router.get("/history")
def seller_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Seller access only")

    try:
        rows = (
            db.query(Negotiation, ProductOffer, Product, User)
            .join(ProductOffer, Negotiation.product_offer_id == ProductOffer.id)
            .join(Product, ProductOffer.product_id == Product.id)
            .join(User, Negotiation.buyer_user_id == User.id)
            .filter(Negotiation.seller_user_id == current_user.id)
            .order_by(Negotiation.started_at.desc())
            .all()
        )

        result = []

        seen_ids = set()   # prevent duplicates

        for negotiation, offer, product, buyer in rows:
            if negotiation.id in seen_ids:
                continue
            seen_ids.add(negotiation.id)

            row = {
                "negotiation_id": negotiation.id,
                "product_title": product.title if product else "Unknown Product",
                "buyer_name": buyer.name if buyer else "Buyer",
                "listed_price": float(negotiation.listed_price or 0),
                "final_price": float(negotiation.final_price or 0),
                "status": negotiation.status,
                "buyer_approved": bool(negotiation.buyer_approved),
                "seller_approved": bool(negotiation.seller_approved),
                "started_at": negotiation.started_at.isoformat() if negotiation.started_at else None,
                "contact": None,
            }

            if negotiation.status == "APPROVED" and buyer:
                row["contact"] = {
                    "name": buyer.name,
                    "email": buyer.email,
                }

            result.append(row)

        return result

    except Exception as e:
        print("SELLER HISTORY ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=f"Seller history failed: {str(e)}")