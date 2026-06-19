from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from utils.deps import get_db, get_current_user
from models.user import User
from models.negotiation import Negotiation
from models.product import ProductOffer, Product

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
def analytics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        if current_user.role == "buyer":
            negotiations = (
                db.query(Negotiation)
                .filter(Negotiation.buyer_user_id == current_user.id)
                .all()
            )

            total = len(negotiations)
            approved = [n for n in negotiations if n.status == "APPROVED"]
            pending = [n for n in negotiations if n.status == "PENDING_APPROVALS"]
            cancelled = [n for n in negotiations if n.status == "CANCELLED"]
            failed = [n for n in negotiations if n.status == "FAILED"]

            total_savings = 0
            for n in approved:
                if n.final_price is not None and n.listed_price is not None:
                    total_savings += float(n.listed_price) - float(n.final_price)

            avg_final_price = (
                sum(float(n.final_price or 0) for n in approved) / len(approved)
                if approved else 0
            )

            success_rate = round((len(approved) / total) * 100, 2) if total else 0

            return {
                "role": "buyer",
                "total_negotiations": total,
                "approved_deals": len(approved),
                "pending_deals": len(pending),
                "cancelled_deals": len(cancelled),
                "failed_deals": len(failed),
                "success_rate": success_rate,
                "total_savings": round(total_savings, 2),
                "average_final_price": round(avg_final_price, 2),
            }

        if current_user.role == "seller":
            negotiations = (
                db.query(Negotiation)
                .filter(Negotiation.seller_user_id == current_user.id)
                .all()
            )

            products = (
                db.query(ProductOffer)
                .filter(ProductOffer.seller_user_id == current_user.id)
                .all()
            )

            total = len(negotiations)
            approved = [n for n in negotiations if n.status == "APPROVED"]
            pending = [n for n in negotiations if n.status == "PENDING_APPROVALS"]
            cancelled = [n for n in negotiations if n.status == "CANCELLED"]
            failed = [n for n in negotiations if n.status == "FAILED"]

            total_revenue = sum(float(n.final_price or 0) for n in approved)
            avg_deal_value = total_revenue / len(approved) if approved else 0
            success_rate = round((len(approved) / total) * 100, 2) if total else 0

            active_products = [p for p in products if getattr(p, "stock_status", None) != "Sold"]

            return {
                "role": "seller",
                "total_negotiations": total,
                "approved_deals": len(approved),
                "pending_deals": len(pending),
                "cancelled_deals": len(cancelled),
                "failed_deals": len(failed),
                "success_rate": success_rate,
                "total_revenue": round(total_revenue, 2),
                "average_deal_value": round(avg_deal_value, 2),
                "total_products": len(products),
                "active_products": len(active_products),
            }

        return {"role": current_user.role}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics failed: {str(e)}")