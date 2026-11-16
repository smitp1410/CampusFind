import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    student_faculty_id = Column(String(100), nullable=True)
    role = Column(String(50), default=UserRole.STUDENT.value, nullable=False)
    department = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    is_verified = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    items = relationship("Item", back_populates="reporter", cascade="all, delete-orphan")
    claims = relationship("Claim", foreign_keys="Claim.claimant_id", back_populates="claimant")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
