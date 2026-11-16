from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.category import CategoryResponse
from app.schemas.location import LocationResponse

class ItemImageBase(BaseModel):
    image_url: str
    public_id: Optional[str] = None
    is_primary: bool = False

class ItemImageResponse(ItemImageBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ReporterSummary(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

class ItemBase(BaseModel):
    type: str = Field(..., description="'LOST' or 'FOUND'")
    title: str = Field(..., min_length=3, max_length=200)
    category_id: int
    description: str = Field(..., min_length=10)
    color: str = Field(..., min_length=2, max_length=100)
    brand: Optional[str] = None
    date_occurred: datetime
    location_id: int
    specific_location: Optional[str] = None
    floor: Optional[str] = None
    identifying_details: Optional[str] = None
    storage_location: Optional[str] = None
    is_sensitive: bool = False

class ItemCreate(ItemBase):
    image_urls: Optional[List[str]] = []

class ItemUpdate(BaseModel):
    title: Optional[str] = None
    category_id: Optional[int] = None
    description: Optional[str] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    date_occurred: Optional[datetime] = None
    location_id: Optional[int] = None
    specific_location: Optional[str] = None
    floor: Optional[str] = None
    identifying_details: Optional[str] = None
    storage_location: Optional[str] = None
    status: Optional[str] = None
    is_sensitive: Optional[bool] = None

class ClaimSummaryResponse(BaseModel):
    id: int
    claimant_id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ItemResponse(ItemBase):
    id: int
    status: str
    reporter_id: int
    created_at: datetime
    updated_at: datetime
    
    category: Optional[CategoryResponse] = None
    location: Optional[LocationResponse] = None
    reporter: Optional[ReporterSummary] = None
    images: List[ItemImageResponse] = []
    claims: List[ClaimSummaryResponse] = []

    class Config:
        from_attributes = True

class PaginatedItemResponse(BaseModel):
    items: List[ItemResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
