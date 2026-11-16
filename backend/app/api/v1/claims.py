import random
import string
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from app.core.database import get_db
from app.models.claim import Claim, Handover, ClaimStatus, HandoverStatus
from app.models.item import Item, ItemStatus, ItemType
from app.models.user import User, UserRole
from app.models.notification import Notification, NotificationType
from app.models.audit_log import AuditLog
from app.schemas.claim import (
    ClaimCreate, ClaimStatusUpdate, ClaimResponse, HandoverCreate, HandoverResponse
)
from app.api.deps import get_current_user, require_admin

router = APIRouter(prefix="/claims", tags=["Claims & Handovers"])

def generate_handover_code() -> str:
    digits = "".join(random.choices(string.digits, k=4))
    letters = "".join(random.choices(string.ascii_uppercase, k=2))
    return f"CF-{letters}{digits}"

@router.post("/", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
def submit_claim(
    claim_in: ClaimCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(Item).filter(Item.id == claim_in.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    if item.status in [ItemStatus.CLAIMED.value, ItemStatus.RESOLVED.value, ItemStatus.CLOSED.value]:
        raise HTTPException(
            status_code=400,
            detail=f"This item is already {item.status.lower()} and cannot be claimed."
        )

    # Check if user already submitted a pending claim on this item
    existing = db.query(Claim).filter(
        Claim.item_id == claim_in.item_id,
        Claim.claimant_id == current_user.id,
        Claim.status.in_([ClaimStatus.PENDING.value, ClaimStatus.UNDER_REVIEW.value, ClaimStatus.APPROVED.value])
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="You already have an active claim submitted for this item."
        )

    claim = Claim(
        item_id=claim_in.item_id,
        lost_item_id=claim_in.lost_item_id,
        claimant_id=current_user.id,
        ownership_proof=claim_in.ownership_proof.strip(),
        proof_image_url=claim_in.proof_image_url,
        status=ClaimStatus.PENDING.value
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)

    # Notify the reporter of the item
    notif_reporter = Notification(
        user_id=item.reporter_id,
        title="New Ownership Claim Received",
        message=f"A student has submitted an ownership claim for the found item '{item.title}'. Campus staff will review it.",
        type=NotificationType.CLAIM_SUBMITTED.value,
        link="/claims"
    )
    db.add(notif_reporter)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="SUBMIT_CLAIM",
        target_type="claim",
        target_id=claim.id,
        details=f"User {current_user.email} submitted claim on item #{item.id} ('{item.title}')"
    )
    db.add(audit)
    db.commit()

    return claim

@router.get("/my-claims", response_model=List[ClaimResponse])
def get_my_claims(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claims = db.query(Claim).options(
        joinedload(Claim.item).joinedload(Item.images),
        joinedload(Claim.item).joinedload(Item.category),
        joinedload(Claim.item).joinedload(Item.location),
        joinedload(Claim.lost_item),
        joinedload(Claim.claimant),
        joinedload(Claim.handover)
    ).filter(Claim.claimant_id == current_user.id).order_by(desc(Claim.created_at)).all()
    return claims

@router.get("/{claim_id}", response_model=ClaimResponse)
def get_claim_by_id(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim = db.query(Claim).options(
        joinedload(Claim.item).joinedload(Item.images),
        joinedload(Claim.item).joinedload(Item.category),
        joinedload(Claim.item).joinedload(Item.location),
        joinedload(Claim.lost_item),
        joinedload(Claim.claimant),
        joinedload(Claim.handover)
    ).filter(Claim.id == claim_id).first()

    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")

    is_staff = current_user.role in [UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value]
    if claim.claimant_id != current_user.id and not is_staff:
        raise HTTPException(status_code=403, detail="Unauthorized to view this claim.")

    return claim

@router.put("/{claim_id}/status", response_model=ClaimResponse)
def update_claim_status(
    claim_id: int,
    status_in: ClaimStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    claim = db.query(Claim).options(
        joinedload(Claim.item),
        joinedload(Claim.claimant),
        joinedload(Claim.handover)
    ).filter(Claim.id == claim_id).first()

    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")

    new_status = status_in.status.upper()
    if new_status not in [e.value for e in ClaimStatus]:
        raise HTTPException(status_code=400, detail="Invalid claim status.")

    claim.status = new_status
    claim.admin_notes = status_in.admin_notes
    claim.reviewed_by_id = admin_user.id
    claim.reviewed_at = datetime.now(timezone.utc)

    # If APPROVED: create Handover record if not already created
    if new_status == ClaimStatus.APPROVED.value:
        claim.item.status = ItemStatus.CLAIMED.value
        
        if not claim.handover:
            code = generate_handover_code()
            handover = Handover(
                claim_id=claim.id,
                handover_code=code,
                handover_location=status_in.handover_location or "Main Campus Security Post, Window 2",
                scheduled_time=status_in.scheduled_time,
                status=HandoverStatus.SCHEDULED.value,
                notes=status_in.admin_notes
            )
            db.add(handover)

        # Notify claimant
        notif = Notification(
            user_id=claim.claimant_id,
            title="Claim Approved! Handover Scheduled",
            message=f"Your claim for '{claim.item.title}' has been APPROVED! Visit {status_in.handover_location or 'Main Campus Security Post'} to collect your item.",
            type=NotificationType.CLAIM_STATUS.value,
            link=f"/claims/{claim.id}"
        )
        db.add(notif)

    elif new_status == ClaimStatus.REJECTED.value:
        notif = Notification(
            user_id=claim.claimant_id,
            title="Claim Status Update",
            message=f"Your claim for '{claim.item.title}' was reviewed and could not be verified. Note: {claim.admin_notes or 'Proof details did not match item specifics.'}",
            type=NotificationType.CLAIM_STATUS.value,
            link=f"/claims/{claim.id}"
        )
        db.add(notif)

    elif new_status == ClaimStatus.RETURNED.value:
        claim.item.status = ItemStatus.RESOLVED.value
        if claim.lost_item:
            claim.lost_item.status = ItemStatus.RESOLVED.value
        if claim.handover:
            claim.handover.status = HandoverStatus.COMPLETED.value
            claim.handover.completed_at = datetime.now(timezone.utc)
            claim.handover.confirmed_by_id = admin_user.id

        notif = Notification(
            user_id=claim.claimant_id,
            title="Item Returned Successfully",
            message=f"Handover completed! '{claim.item.title}' is officially marked as returned. Thank you for using CampusFind!",
            type=NotificationType.ITEM_RETURNED.value,
            link=f"/claims/{claim.id}"
        )
        db.add(notif)

    # Audit log
    audit = AuditLog(
        user_id=admin_user.id,
        action=f"CLAIM_{new_status}",
        target_type="claim",
        target_id=claim.id,
        details=f"Admin {admin_user.email} updated claim #{claim.id} to {new_status}"
    )
    db.add(audit)
    db.commit()
    db.refresh(claim)
    return claim

@router.post("/{claim_id}/verify-handover", response_model=ClaimResponse)
def verify_and_complete_handover(
    claim_id: int,
    handover_code: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    claim = db.query(Claim).options(
        joinedload(Claim.item),
        joinedload(Claim.handover),
        joinedload(Claim.lost_item)
    ).filter(Claim.id == claim_id).first()

    if not claim or not claim.handover:
        raise HTTPException(status_code=404, detail="Handover record not found.")

    if claim.handover.handover_code.strip().upper() != handover_code.strip().upper():
        raise HTTPException(status_code=400, detail="Invalid verification code provided.")

    claim.status = ClaimStatus.RETURNED.value
    claim.item.status = ItemStatus.RESOLVED.value
    if claim.lost_item:
        claim.lost_item.status = ItemStatus.RESOLVED.value

    claim.handover.status = HandoverStatus.COMPLETED.value
    claim.handover.completed_at = datetime.now(timezone.utc)
    claim.handover.confirmed_by_id = admin_user.id

    notif = Notification(
        user_id=claim.claimant_id,
        title="Handover Verified & Item Returned",
        message=f"Your handover code was verified. '{claim.item.title}' is successfully marked as returned.",
        type=NotificationType.ITEM_RETURNED.value,
        link=f"/claims/{claim.id}"
    )
    db.add(notif)
    db.commit()
    db.refresh(claim)
    return claim
