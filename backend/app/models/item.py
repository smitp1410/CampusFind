import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class ItemType(str, enum.Enum):
    LOST = "LOST"
    FOUND = "FOUND"

class ItemStatus(str, enum.Enum):
    PENDING = "PENDING"
    OPEN = "OPEN"
    VERIFIED = "VERIFIED"
    MATCHED = "MATCHED"
    CLAIMED = "CLAIMED"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"
    CLOSED = "CLOSED"

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(20), index=True, nullable=False)  # "LOST" or "FOUND"
    title = Column(String(255), index=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    description = Column(Text, nullable=False)
    color = Column(String(100), nullable=False)
    brand = Column(String(150), nullable=True)
    date_occurred = Column(DateTime, nullable=False)  # Lost date or Found date
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    specific_location = Column(String(255), nullable=True)
    floor = Column(String(100), nullable=True)
    identifying_details = Column(Text, nullable=True)  # Sensitive or private marks
    status = Column(String(30), default=ItemStatus.PENDING.value, index=True, nullable=False)
    storage_location = Column(String(255), nullable=True)  # Where found item is securely kept
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_sensitive = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    reporter = relationship("User", back_populates="items")
    category = relationship("Category", back_populates="items")
    location = relationship("Location", back_populates="items")
    images = relationship("ItemImage", back_populates="item", cascade="all, delete-orphan", order_by="desc(ItemImage.is_primary)")
    claims = relationship("Claim", foreign_keys="Claim.item_id", back_populates="item", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_items_type_status", "type", "status"),
        Index("idx_items_created_at", "created_at"),
    )

class ItemImage(Base):
    __tablename__ = "item_images"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(1000), nullable=False)
    public_id = Column(String(255), nullable=True)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    item = relationship("Item", back_populates="images")
