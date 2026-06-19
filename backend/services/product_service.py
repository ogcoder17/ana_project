from sqlalchemy.orm import Session
from models.product import Product, ProductOffer


def save_offer_to_db(db: Session, payload):
    product = Product(
        category=payload.category or "General",
        title=payload.title,
        brand=payload.brand,
        model=payload.model,
        attributes_json=None,
    )
    db.add(product)
    db.flush()

    offer = ProductOffer(
        product_id=product.id,
        seller_user_id=payload.seller_user_id,
        source_name=payload.source_name,
        source_product_id=payload.source_product_id,
        seller_name=payload.seller_name,
        listed_price=payload.listed_price,
        currency=payload.currency,
        product_url=payload.product_url,
        image_url=payload.image_url,
        stock_status=payload.stock_status,
        condition=payload.condition,
        shipping=payload.shipping,
        highlights=payload.highlights,
    )
    db.add(offer)
    db.commit()
    db.refresh(product)
    db.refresh(offer)

    return product, offer