from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel
from app.schemas.item import ItemResponse

class MatchResponse(BaseModel):
    id: int
    lost_item_id: int
    found_item_id: int
    score: float
    classification: str
    breakdown: Optional[Dict[str, Any]] = None
    status: str
    created_at: datetime
    
    lost_item: Optional[ItemResponse] = None
    found_item: Optional[ItemResponse] = None

    class Config:
        from_attributes = True

class MatchStatusUpdate(BaseModel):
    status: str  # "ACCEPTED" or "DISMISSED"
