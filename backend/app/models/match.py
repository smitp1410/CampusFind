import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey, UniqueConstraint, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class MatchClassification(str, enum.Enum):
    STRONG = "STRONG"      # 80 - 100
    POSSIBLE = "POSSIBLE"  # 50 - 79
    LOW = "LOW"            # < 50

class MatchStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DISMISSED = "DISMISSED"

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    lost_item_id = Column(Integer, ForeignKey("items.id", ondelete="CASCADE"), nullable=False)
    found_item_id = Column(Integer, ForeignKey("items.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)  # Normalized 0.0 to 100.0
    classification = Column(String(50), nullable=False)  # STRONG, POSSIBLE, LOW
    breakdown = Column(JSON, nullable=True)  # Detailed 6-factor score components and explanation
    status = Column(String(30), default=MatchStatus.PENDING.value, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    lost_item = relationship("Item", foreign_keys=[lost_item_id])
    found_item = relationship("Item", foreign_keys=[found_item_id])

    __table_args__ = (
        UniqueConstraint("lost_item_id", "found_item_id", name="uq_lost_found_match"),
    )
