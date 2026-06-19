from sqlalchemy import Column, Integer, String, DateTime, Text, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.session import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(120), nullable=False, default="General")
    title = Column(String(255), nullable=False)
    brand = Column(String(120), nullable=True)
    model = Column(String(120), nullable=True)
    attributes_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    offers = relationship("ProductOffer", back_populates="product", cascade="all, delete-orphan")


class ProductOffer(Base):
    __tablename__ = "product_offers"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    seller_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    source_name = Column(String(100), nullable=False)
    source_product_id = Column(String(255), nullable=True)
    seller_name = Column(String(255), nullable=True)
    listed_price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), nullable=False, default="INR")
    product_url = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    stock_status = Column(String(50), nullable=True)
    condition = Column(String(120), nullable=True)
    shipping = Column(String(255), nullable=True)
    highlights = Column(Text, nullable=True)
    last_synced_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="offers")
    negotiations = relationship("Negotiation", back_populates="product_offer")