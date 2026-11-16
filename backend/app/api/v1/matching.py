from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc
from app.core.database import get_db
from app.models.match import Match, MatchStatus
from app.models.item import Item, ItemType, ItemStatus
from app.models.user import User
from app.schemas.match import MatchResponse, MatchStatusUpdate
from app.services.matching_engine import run_matching_for_item
from app.api.deps import get_current_user

router = APIRouter(prefix="/matching", tags=["Smart Matching Engine"])

@router.get("/my-matches", response_model=List[MatchResponse])
def get_my_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find all matches where current_user is the reporter of either the lost or found item
    user_item_ids = [it.id for it in db.query(Item.id).filter(Item.reporter_id == current_user.id).all()]
    
    if not user_item_ids:
        return []

    matches = db.query(Match).options(
        joinedload(Match.lost_item).joinedload(Item.images),
        joinedload(Match.lost_item).joinedload(Item.category),
        joinedload(Match.lost_item).joinedload(Item.location),
        joinedload(Match.lost_item).joinedload(Item.reporter),
        joinedload(Match.found_item).joinedload(Item.images),
        joinedload(Match.found_item).joinedload(Item.category),
        joinedload(Match.found_item).joinedload(Item.location),
        joinedload(Match.found_item).joinedload(Item.reporter)
    ).filter(
        or_(
            Match.lost_item_id.in_(user_item_ids),
            Match.found_item_id.in_(user_item_ids)
        )
    ).order_by(desc(Match.score)).all()

    return matches

@router.get("/{match_id}", response_model=MatchResponse)
def get_match_detail(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    match = db.query(Match).options(
        joinedload(Match.lost_item).joinedload(Item.images),
        joinedload(Match.lost_item).joinedload(Item.category),
        joinedload(Match.lost_item).joinedload(Item.location),
        joinedload(Match.lost_item).joinedload(Item.reporter),
        joinedload(Match.found_item).joinedload(Item.images),
        joinedload(Match.found_item).joinedload(Item.category),
        joinedload(Match.found_item).joinedload(Item.location),
        joinedload(Match.found_item).joinedload(Item.reporter)
    ).filter(Match.id == match_id).first()

    if not match:
        raise HTTPException(status_code=404, detail="Match record not found.")

    return match

@router.put("/{match_id}/status", response_model=MatchResponse)
def update_match_status(
    match_id: int,
    status_in: MatchStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match record not found.")

    if status_in.status.upper() not in [MatchStatus.ACCEPTED.value, MatchStatus.DISMISSED.value, MatchStatus.PENDING.value]:
        raise HTTPException(status_code=400, detail="Invalid match status.")

    match.status = status_in.status.upper()
    db.commit()
    db.refresh(match)
    return match

@router.post("/recalculate")
def recalculate_all_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Triggers smart matching calculation across all active lost items."""
    lost_items = db.query(Item).filter(
        Item.type == ItemType.LOST.value,
        Item.status.in_([ItemStatus.OPEN.value, ItemStatus.MATCHED.value])
    ).all()

    total_evaluated = 0
    total_matches_updated = 0
    for it in lost_items:
        res = run_matching_for_item(db, it)
        total_evaluated += 1
        total_matches_updated += len(res)

    return {
        "message": "Smart matching recalculated successfully.",
        "evaluated_items_count": total_evaluated,
        "matches_generated_or_updated": total_matches_updated
    }
