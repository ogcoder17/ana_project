from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from utils.deps import get_db, get_current_user
from schemas.product import SaveOfferRequest, SaveOfferResponse
from services.product_service import save_offer_to_db

router = APIRouter(prefix="/products", tags=["products"])


@router.post("/save-offer", response_model=SaveOfferResponse)
def save_offer(
    payload: SaveOfferRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        product, offer = save_offer_to_db(db, payload)
        return {
            "product_id": product.id,
            "product_offer_id": offer.id,
            "message": "Offer saved successfully",
        }
    except Exception as e:
        db.rollback()
        print("SAVE OFFER ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=f"Save offer failed: {str(e)}")