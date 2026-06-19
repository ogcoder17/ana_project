from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.session import Base


class Negotiation(Base):
    __tablename__ = "negotiations"

    id = Column(Integer, primary_key=True, index=True)
    buyer_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    product_offer_id = Column(Integer, ForeignKey("product_offers.id"), nullable=False)

    status = Column(String(30), nullable=False, default="AUTO_NEGOTIATING")
    buyer_budget = Column(Numeric(10, 2), nullable=False)
    listed_price = Column(Numeric(10, 2), nullable=False)
    final_price = Column(Numeric(10, 2), nullable=True)

    buyer_approved = Column(Boolean, nullable=False, default=False)
    seller_approved = Column(Boolean, nullable=False, default=False)

    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)

    product_offer = relationship("ProductOffer", back_populates="negotiations")
    rounds = relationship("NegotiationRound", back_populates="negotiation", cascade="all, delete-orphan")


class NegotiationRound(Base):
    __tablename__ = "negotiation_rounds"

    id = Column(Integer, primary_key=True, index=True)
    negotiation_id = Column(Integer, ForeignKey("negotiations.id"), nullable=False)
    round_no = Column(Integer, nullable=False)
    buyer_offer = Column(Numeric(10, 2), nullable=False)
    seller_offer = Column(Numeric(10, 2), nullable=False)
    seller_action = Column(String(20), nullable=False)
    note = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    negotiation = relationship("Negotiation", back_populates="rounds")