from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.item import Item, ItemType, ItemStatus
from app.models.claim import Claim, ClaimStatus
from app.models.match import Match
from app.models.audit_log import AuditLog
from app.schemas.user import UserResponse
from app.schemas.item import ItemResponse
from app.schemas.claim import ClaimResponse
from app.api.deps import require_admin, require_super_admin

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin)
):
    total_users = db.query(User).count()
    total_lost = db.query(Item).filter(Item.type == ItemType.LOST.value).count()
    total_found = db.query(Item).filter(Item.type == ItemType.FOUND.value).count()
    total_recovered = db.query(Item).filter(Item.status == ItemStatus.RESOLVED.value).count()
    pending_claims = db.query(Claim).filter(Claim.status.in_([ClaimStatus.PENDING.value, ClaimStatus.UNDER_REVIEW.value])).count()
    active_matches = db.query(Match).filter(Match.score >= 50.0).count()
    
    recovery_rate = round((total_recovered / max(total_lost + total_found, 1)) * 100, 1)

    return {
        "total_users": total_users,
        "total_lost": total_lost,
        "total_found": total_found,
        "total_recovered": total_recovered,
        "recovery_rate": recovery_rate,
        "pending_claims": pending_claims,
        "active_matches": active_matches
    }

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    users = query.order_by(desc(User.created_at)).offset((page - 1) * page_size).limit(page_size).all()
    return users

@router.put("/users/{user_id}/role", response_model=UserResponse)
def change_user_role(
    user_id: int,
    new_role: str = Query(..., description="student, faculty, admin, super_admin"),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_super_admin)
):
    valid_roles = [e.value for e in UserRole]
    if new_role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {valid_roles}")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    old_role = target_user.role
    target_user.role = new_role

    audit = AuditLog(
        user_id=admin_user.id,
        action="UPDATE_USER_ROLE",
        target_type="user",
        target_id=target_user.id,
        details=f"Admin {admin_user.email} changed role of user {target_user.email} from {old_role} to {new_role}"
    )
    db.add(audit)
    db.commit()
    db.refresh(target_user)
    return target_user

@router.put("/users/{user_id}/status", response_model=UserResponse)
def toggle_user_active_status(
    user_id: int,
    is_active: bool = Query(...),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    target_user.is_active = is_active
    audit = AuditLog(
        user_id=admin_user.id,
        action="TOGGLE_USER_STATUS",
        target_type="user",
        target_id=target_user.id,
        details=f"Admin {admin_user.email} set active={is_active} for user {target_user.email}"
    )
    db.add(audit)
    db.commit()
    db.refresh(target_user)
    return target_user

@router.get("/items", response_model=List[ItemResponse])
def get_all_items_admin(
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin)
):
    query = db.query(Item).options(
        joinedload(Item.category),
        joinedload(Item.location),
        joinedload(Item.reporter),
        joinedload(Item.images)
    )
    if type:
        query = query.filter(Item.type == type.upper())
    if status:
        query = query.filter(Item.status == status.upper())

    items = query.order_by(desc(Item.created_at)).offset((page - 1) * page_size).limit(page_size).all()
    return items

@router.put("/items/{item_id}/status", response_model=ItemResponse)
def update_item_status_admin(
    item_id: int,
    new_status: str = Query(...),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    valid_statuses = [e.value for e in ItemStatus]
    if new_status.upper() not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    item.status = new_status.upper()
    audit = AuditLog(
        user_id=admin_user.id,
        action="MODERATE_ITEM_STATUS",
        target_type="item",
        target_id=item.id,
        details=f"Admin {admin_user.email} changed item #{item.id} status to {new_status.upper()}"
    )
    db.add(audit)
    db.commit()
    db.refresh(item)
    return item

@router.get("/claims", response_model=List[ClaimResponse])
def get_all_claims_admin(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin)
):
    query = db.query(Claim).options(
        joinedload(Claim.item).joinedload(Item.images),
        joinedload(Claim.item).joinedload(Item.category),
        joinedload(Claim.item).joinedload(Item.location),
        joinedload(Claim.lost_item),
        joinedload(Claim.claimant),
        joinedload(Claim.handover)
    )
    if status:
        query = query.filter(Claim.status == status.upper())

    claims = query.order_by(desc(Claim.created_at)).all()
    return claims

@router.get("/audit-logs")
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin)
):
    logs = db.query(AuditLog).options(
        joinedload(AuditLog.user)
    ).order_by(desc(AuditLog.created_at)).limit(limit).all()

    return [
        {
            "id": l.id,
            "action": l.action,
            "target_type": l.target_type,
            "target_id": l.target_id,
            "details": l.details,
            "created_at": l.created_at,
            "user_email": l.user.email if l.user else "System",
            "user_name": l.user.full_name if l.user else "System"
        }
        for l in logs
    ]
