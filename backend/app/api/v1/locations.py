from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.location import Location
from app.schemas.location import LocationResponse, LocationCreate
from app.api.deps import require_admin

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("/", response_model=List[LocationResponse])
def get_locations(db: Session = Depends(get_db)):
    return db.query(Location).order_by(Location.building_name.asc()).all()

@router.post("/", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
def create_location(
    loc_in: LocationCreate,
    db: Session = Depends(get_db),
    _admin = Depends(require_admin)
):
    loc = Location(
        campus_name=loc_in.campus_name,
        building_name=loc_in.building_name,
        zone_code=loc_in.zone_code,
        description=loc_in.description
    )
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc
