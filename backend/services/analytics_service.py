from sqlalchemy.orm import Session
from sqlalchemy import func

from models.negotiation import Negotiation
from models.product import ProductOffer


def get_buyer_analytics(db: Session, user_id: int):
    total = db.query(func.count(Negotiation.id)).filter(
        Negotiation.buyer_user_id == user_id
    ).scalar() or 0

    agreed = db.query(func.count(Negotiation.id)).filter(
        Negotiation.buyer_user_id == user_id,
        Negotiation.status == "AGREED"
    ).scalar() or 0

    avg_savings = db.query(
        func.avg(Negotiation.listed_price - Negotiation.final_price)
    ).filter(
        Negotiation.buyer_user_id == user_id,
        Negotiation.status == "AGREED",
        Negotiation.final_price.isnot(None)
    ).scalar()

    return {
        "total_negotiations": total,
        "agreed_negotiations": agreed,
        "success_rate": round((agreed / total) * 100, 2) if total else 0,
        "average_savings": round(float(avg_savings), 2) if avg_savings is not None else 0,
    }


def get_seller_analytics(db: Session, seller_name: str):
    total = db.query(func.count(Negotiation.id)).join(
        ProductOffer, Negotiation.product_offer_id == ProductOffer.id
    ).filter(
        ProductOffer.seller_name == seller_name
    ).scalar() or 0

    agreed = db.query(func.count(Negotiation.id)).join(
        ProductOffer, Negotiation.product_offer_id == ProductOffer.id
    ).filter(
        ProductOffer.seller_name == seller_name,
        Negotiation.status == "AGREED"
    ).scalar() or 0

    avg_final = db.query(func.avg(Negotiation.final_price)).join(
        ProductOffer, Negotiation.product_offer_id == ProductOffer.id
    ).filter(
        ProductOffer.seller_name == seller_name,
        Negotiation.final_price.isnot(None)
    ).scalar()

    return {
        "total_requests": total,
        "closed_deals": agreed,
        "close_rate": round((agreed / total) * 100, 2) if total else 0,
        "average_final_price": round(float(avg_final), 2) if avg_final is not None else 0,
    }