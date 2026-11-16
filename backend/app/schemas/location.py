from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class LocationBase(BaseModel):
    campus_name: str = "Main Campus"
    building_name: str
    zone_code: Optional[str] = None
    description: Optional[str] = None

class LocationCreate(LocationBase):
    pass

class LocationResponse(LocationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
