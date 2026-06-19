from sqlalchemy.orm import Session
from models.seller_product import SellerProduct


def create_seller_product(db: Session, seller_user_id: int, payload):
    product = SellerProduct(
        seller_user_id=seller_user_id,
        title=payload.title,
        category=payload.category,
        brand=payload.brand,
        description=payload.description,
        price=payload.price,
        currency=payload.currency,
        image_url=payload.image_url,
        status=payload.status,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_seller_products(db: Session, seller_user_id: int):
    return (
        db.query(SellerProduct)
        .filter(SellerProduct.seller_user_id == seller_user_id)
        .order_by(SellerProduct.created_at.desc())
        .all()
    )


def search_seller_products(db: Session, query: str, limit: int = 12):
    return (
        db.query(SellerProduct)
        .filter(SellerProduct.status == "Active")
        .filter(SellerProduct.title.ilike(f"%{query}%"))
        .limit(limit)
        .all()
    )