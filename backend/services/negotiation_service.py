from datetime import datetime, timezone
from sqlalchemy.orm import Session

from agents.buyer_agent import BuyerAgent
from agents.seller_agent import SellerAgent, SellerPolicy
from agents.negotiation_engine import NegotiationSession, SESSIONS
from models.product import ProductOffer
from models.negotiation import Negotiation, NegotiationRound


def _run_auto_session(
    listed_price: float,
    budget: float,
    seller_name: str,
    concede_step: int = 250,
    floor_ratio: float = 0.90,
    buyer_discount: int = 500,
    starting_offer: float = None,
):
    buyer = BuyerAgent(
        budget=int(budget),
        target_discount=buyer_discount,
        starting_offer=int(starting_offer) if starting_offer else None,
    )

    seller = SellerAgent(
        seller_name=seller_name or "Seller",
        deal_price=int(listed_price),
        policy=SellerPolicy(
            floor_price=int(listed_price * floor_ratio),
            concede_step=concede_step,
            midpoint_weight=0.6,
        ),
    )

    session = NegotiationSession(
        buyer,
        seller,
        listed_price=int(listed_price),
        max_rounds=6,
    )

    SESSIONS[session.session_id] = session

    result = session.start()

    while result["status"] == "IN_PROGRESS":
        result = session.step(user_action="AUTO")

    return session, result


def start_db_negotiation(
    db: Session,
    buyer_user_id: int,
    product_offer_id: int,
    budget: float,
    starting_offer: float = None,
):
    offer = db.query(ProductOffer).filter(ProductOffer.id == product_offer_id).first()

    if not offer:
        raise ValueError("Product offer not found")

    existing = (
        db.query(Negotiation)
        .filter(Negotiation.buyer_user_id == buyer_user_id)
        .filter(Negotiation.product_offer_id == product_offer_id)
        .filter(Negotiation.status.in_(["AUTO_NEGOTIATING", "PENDING_APPROVALS"]))
        .order_by(Negotiation.started_at.desc())
        .first()
    )

    if existing:
        return get_negotiation_payload(db, existing.id)

    listed_price = float(offer.listed_price)

    session, live_result = _run_auto_session(
        listed_price=listed_price,
        budget=budget,
        seller_name=offer.seller_name or "Seller",
        starting_offer=starting_offer,
    )

    if live_result["status"] in ["AGREED", "FINAL_OFFER"]:
        final_status = "PENDING_APPROVALS"
    else:
        final_status = live_result["status"]

    final_price = live_result.get("agreed_price") or live_result.get("last_seller_offer")

    negotiation = Negotiation(
        buyer_user_id=buyer_user_id,
        seller_user_id=offer.seller_user_id,
        product_offer_id=product_offer_id,
        status=final_status,
        buyer_budget=budget,
        listed_price=listed_price,
        final_price=final_price,
        buyer_approved=False,
        seller_approved=False,
        ended_at=datetime.now(timezone.utc) if final_status in {"FAILED", "CANCELLED"} else None,
    )

    db.add(negotiation)
    db.flush()

    for r in live_result["rounds"]:
        db.add(
            NegotiationRound(
                negotiation_id=negotiation.id,
                round_no=r["round_no"],
                buyer_offer=r["buyer_offer"],
                seller_offer=r["seller_offer"],
                seller_action=r["seller_action"],
                note=r["note"],
            )
        )

    db.commit()
    db.refresh(negotiation)

    live_result["negotiation_id"] = negotiation.id
    live_result["product_offer_id"] = product_offer_id
    live_result["status"] = final_status
    live_result["buyer_approved"] = negotiation.buyer_approved
    live_result["seller_approved"] = negotiation.seller_approved
    live_result["final_price"] = float(negotiation.final_price) if negotiation.final_price is not None else None

    return live_result


def get_negotiation_payload(db: Session, negotiation_id: int):
    negotiation = db.query(Negotiation).filter(Negotiation.id == negotiation_id).first()

    if not negotiation:
        raise ValueError("Negotiation not found")

    rounds = (
        db.query(NegotiationRound)
        .filter(NegotiationRound.negotiation_id == negotiation.id)
        .order_by(NegotiationRound.round_no.asc())
        .all()
    )

    return {
        "negotiation_id": negotiation.id,
        "status": negotiation.status,
        "listed_price": float(negotiation.listed_price),
        "final_price": float(negotiation.final_price) if negotiation.final_price is not None else None,
        "buyer_budget": float(negotiation.buyer_budget),
        "buyer_approved": negotiation.buyer_approved,
        "seller_approved": negotiation.seller_approved,
        "rounds": [
            {
                "round_no": r.round_no,
                "buyer_offer": float(r.buyer_offer),
                "seller_offer": float(r.seller_offer),
                "seller_action": r.seller_action,
                "note": r.note,
            }
            for r in rounds
        ],
    }


def buyer_decision(db: Session, negotiation_id: int, buyer_user_id: int, action: str):
    negotiation = db.query(Negotiation).filter(Negotiation.id == negotiation_id).first()

    if not negotiation or negotiation.buyer_user_id != buyer_user_id:
        raise ValueError("Negotiation not found")

    action = action.upper()

    if action == "APPROVE":
        if negotiation.status == "CANCELLED":
            raise ValueError("Negotiation already cancelled")

        negotiation.buyer_approved = True

        if negotiation.seller_approved:
            negotiation.status = "APPROVED"
            negotiation.ended_at = datetime.now(timezone.utc)
        else:
            negotiation.status = "PENDING_APPROVALS"

    elif action == "CANCEL":
        negotiation.status = "CANCELLED"
        negotiation.ended_at = datetime.now(timezone.utc)

    else:
        raise ValueError("Invalid buyer action")

    db.commit()
    return get_negotiation_payload(db, negotiation_id)


def seller_decision(db: Session, negotiation_id: int, seller_user_id: int, action: str):
    negotiation = db.query(Negotiation).filter(Negotiation.id == negotiation_id).first()

    if not negotiation or negotiation.seller_user_id != seller_user_id:
        raise ValueError("Negotiation not found")

    action = action.upper()

    if action == "APPROVE":
        if negotiation.status == "CANCELLED":
            raise ValueError("Negotiation already cancelled")

        negotiation.seller_approved = True

        if negotiation.buyer_approved:
            negotiation.status = "APPROVED"
            negotiation.ended_at = datetime.now(timezone.utc)
        else:
            negotiation.status = "PENDING_APPROVALS"

    elif action == "CANCEL":
        negotiation.status = "CANCELLED"
        negotiation.ended_at = datetime.now(timezone.utc)

    else:
        raise ValueError("Invalid seller action")

    db.commit()
    return get_negotiation_payload(db, negotiation_id)


def renegotiate(db: Session, negotiation_id: int):
    negotiation = db.query(Negotiation).filter(Negotiation.id == negotiation_id).first()

    if not negotiation:
        raise ValueError("Negotiation not found")

    offer = db.query(ProductOffer).filter(ProductOffer.id == negotiation.product_offer_id).first()

    if not offer:
        raise ValueError("Product offer not found")

    existing_rounds = (
        db.query(NegotiationRound)
        .filter(NegotiationRound.negotiation_id == negotiation.id)
        .order_by(NegotiationRound.round_no.asc())
        .all()
    )

    current_cycle = max(1, (len(existing_rounds) // 2) + 1)
    next_round_no = existing_rounds[-1].round_no + 1 if existing_rounds else 1

    concede_step = 250 + (current_cycle * 75)
    floor_ratio = max(0.80, 0.90 - (current_cycle * 0.02))
    buyer_discount = 500 + (current_cycle * 75)

    session, live_result = _run_auto_session(
        listed_price=float(offer.listed_price),
        budget=float(negotiation.buyer_budget),
        seller_name=offer.seller_name or "Seller",
        concede_step=concede_step,
        floor_ratio=floor_ratio,
        buyer_discount=buyer_discount,
        starting_offer=None,
    )

    for idx, r in enumerate(live_result["rounds"], start=0):
        db.add(
            NegotiationRound(
                negotiation_id=negotiation.id,
                round_no=next_round_no + idx,
                buyer_offer=r["buyer_offer"],
                seller_offer=r["seller_offer"],
                seller_action=r["seller_action"],
                note=f"Re-negotiation cycle {current_cycle}: {r['note']}",
            )
        )

    if live_result["status"] in ["AGREED", "FINAL_OFFER"]:
        negotiation.status = "PENDING_APPROVALS"
    else:
        negotiation.status = live_result["status"]

    negotiation.final_price = live_result.get("agreed_price") or live_result.get("last_seller_offer")
    negotiation.buyer_approved = False
    negotiation.seller_approved = False
    negotiation.ended_at = None

    db.commit()

    return get_negotiation_payload(db, negotiation_id)