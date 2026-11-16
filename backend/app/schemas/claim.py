from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.item import ItemResponse
from app.schemas.user import UserResponse

class HandoverResponse(BaseModel):
    id: int
    claim_id: int
    handover_code: str
    handover_location: str
    scheduled_time: Optional[datetime] = None
    status: str
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class HandoverCreate(BaseModel):
    handover_location: str = Field(..., min_length=3)
    scheduled_time: Optional[datetime] = None
    notes: Optional[str] = None

class ClaimCreate(BaseModel):
    item_id: int
    lost_item_id: Optional[int] = None
    ownership_proof: str = Field(..., min_length=15, description="Secret marks, serial numbers, wallpaper description, or distinguishing details")
    proof_image_url: Optional[str] = None

class ClaimStatusUpdate(BaseModel):
    status: str = Field(..., description="'UNDER_REVIEW', 'APPROVED', 'REJECTED', or 'RETURNED'")
    admin_notes: Optional[str] = None
    handover_location: Optional[str] = "Main Campus Security Post"
    scheduled_time: Optional[datetime] = None

class ClaimResponse(BaseModel):
    id: int
    item_id: int
    lost_item_id: Optional[int] = None
    claimant_id: int
    ownership_proof: Optional[str] = None
    proof_image_url: Optional[str] = None
    status: str
    admin_notes: Optional[str] = None
    reviewed_by_id: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    item: Optional[ItemResponse] = None
    lost_item: Optional[ItemResponse] = None
    claimant: Optional[UserResponse] = None
    handover: Optional[HandoverResponse] = None

    class Config:
        from_attributes = True
