import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class ClaimStatus(str, enum.Enum):
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    RETURNED = "RETURNED"

class HandoverStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id", ondelete="CASCADE"), nullable=False)
    lost_item_id = Column(Integer, ForeignKey("items.id", ondelete="SET NULL"), nullable=True)
    claimant_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Ownership proof details (strictly private to claimant and reviewing admin)
    ownership_proof = Column(Text, nullable=False)  # Secret marks, serial number, background wallpaper description, etc.
    proof_image_url = Column(String(1000), nullable=True)
    
    status = Column(String(30), default=ClaimStatus.PENDING.value, index=True, nullable=False)
    admin_notes = Column(Text, nullable=True)
    reviewed_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    item = relationship("Item", foreign_keys=[item_id], back_populates="claims")
    lost_item = relationship("Item", foreign_keys=[lost_item_id])
    claimant = relationship("User", foreign_keys=[claimant_id], back_populates="claims")
    reviewer = relationship("User", foreign_keys=[reviewed_by_id])
    handover = relationship("Handover", back_populates="claim", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_claims_item_status", "item_id", "status"),
    )

class Handover(Base):
    __tablename__ = "handovers"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id", ondelete="CASCADE"), unique=True, nullable=False)
    handover_code = Column(String(50), unique=True, nullable=False)  # Unique verification code e.g. "CF-8392"
    handover_location = Column(String(255), nullable=False)
    scheduled_time = Column(DateTime, nullable=True)
    status = Column(String(30), default=HandoverStatus.SCHEDULED.value, nullable=False)
    confirmed_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    claim = relationship("Claim", back_populates="handover")
    confirmed_by = relationship("User", foreign_keys=[confirmed_by_id])
