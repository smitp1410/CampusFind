from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    campus_name = Column(String(100), default="Main Campus", nullable=False)
    building_name = Column(String(150), index=True, nullable=False)
    zone_code = Column(String(50), nullable=True)  # e.g. "LIB-2F", "STC-1"
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    items = relationship("Item", back_populates="location")
