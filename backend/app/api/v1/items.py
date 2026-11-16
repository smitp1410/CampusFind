import os
import math
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, desc, asc

from app.core.database import get_db
from app.core.cloudinary_service import (
    validate_image_file, upload_image_bytes, generate_signed_upload_params
)
from app.models.item import Item, ItemImage, ItemType, ItemStatus
from app.models.user import User, UserRole
from app.models.audit_log import AuditLog
from app.schemas.item import (
    ItemCreate, ItemUpdate, ItemResponse, PaginatedItemResponse
)
from app.services.matching_engine import run_matching_for_item
from app.api.deps import get_current_user, get_optional_current_user

router = APIRouter(prefix="/items", tags=["Items"])

@router.get("/", response_model=PaginatedItemResponse)
def get_items(
    search: Optional[str] = Query(None, description="Fuzzy search query"),
    type: Optional[str] = Query(None, description="'LOST' or 'FOUND'"),
    category_id: Optional[int] = Query(None),
    location_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    sort_by: Optional[str] = Query("date_desc", description="date_desc, date_asc, created_desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    query = db.query(Item).options(
        joinedload(Item.category),
        joinedload(Item.location),
        joinedload(Item.reporter),
        joinedload(Item.images)
    )

    if type:
        query = query.filter(Item.type == type.upper())
    
    if category_id:
        query = query.filter(Item.category_id == category_id)

    if location_id:
        query = query.filter(Item.location_id == location_id)

    if status_filter:
        query = query.filter(Item.status == status_filter.upper())
    else:
        # Default public discovery: do not show CLOSED items unless requested
        query = query.filter(Item.status != ItemStatus.CLOSED.value)

    if search:
        search_term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                Item.title.ilike(search_term),
                Item.description.ilike(search_term),
                Item.brand.ilike(search_term),
                Item.color.ilike(search_term),
                Item.specific_location.ilike(search_term)
            )
        )

    # Sorting: default to newest item ID first so latest submissions always show at the top
    if sort_by == "date_asc":
        query = query.order_by(asc(Item.date_occurred))
    elif sort_by == "date_desc":
        query = query.order_by(desc(Item.date_occurred), desc(Item.id))
    elif sort_by == "created_asc":
        query = query.order_by(asc(Item.id))
    else:
        query = query.order_by(desc(Item.id))

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    # Privacy mask: if item is FOUND, hide sensitive identifying_details and storage_location for non-staff non-owners
    is_staff = current_user and current_user.role in [UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value]
    sanitized_items = []
    for it in items:
        # If user is owner or staff, keep all details; otherwise mask private storage notes
        if not (is_staff or (current_user and current_user.id == it.reporter_id)):
            if it.type == ItemType.FOUND.value and it.identifying_details:
                # Omit sensitive details from general public display
                it.identifying_details = "Protected: Disclose details during claim verification."
        sanitized_items.append(it)

    return {
        "items": sanitized_items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/recent-lost", response_model=List[ItemResponse])
def get_recent_lost_items(db: Session = Depends(get_db)):
    items = db.query(Item).options(
        joinedload(Item.category),
        joinedload(Item.location),
        joinedload(Item.reporter),
        joinedload(Item.images)
    ).filter(
        Item.type == ItemType.LOST.value,
        Item.status.in_([ItemStatus.PENDING.value, ItemStatus.OPEN.value, ItemStatus.VERIFIED.value, ItemStatus.MATCHED.value])
    ).order_by(desc(Item.id)).limit(6).all()
    return items

@router.get("/recent-found", response_model=List[ItemResponse])
def get_recent_found_items(db: Session = Depends(get_db)):
    items = db.query(Item).options(
        joinedload(Item.category),
        joinedload(Item.location),
        joinedload(Item.reporter),
        joinedload(Item.images)
    ).filter(
        Item.type == ItemType.FOUND.value,
        Item.status.in_([ItemStatus.PENDING.value, ItemStatus.OPEN.value, ItemStatus.VERIFIED.value, ItemStatus.MATCHED.value])
    ).order_by(desc(Item.id)).limit(6).all()
    return items

@router.get("/my-items", response_model=List[ItemResponse])
def get_my_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = db.query(Item).options(
        joinedload(Item.category),
        joinedload(Item.location),
        joinedload(Item.reporter),
        joinedload(Item.images),
        joinedload(Item.claims)
    ).filter(Item.reporter_id == current_user.id).order_by(desc(Item.id)).all()
    return items

@router.get("/{item_id}", response_model=ItemResponse)
def get_item_by_id(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    item = db.query(Item).options(
        joinedload(Item.category),
        joinedload(Item.location),
        joinedload(Item.reporter),
        joinedload(Item.images),
        joinedload(Item.claims)
    ).filter(Item.id == item_id).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found."
        )

    # Privacy mask
    is_staff = current_user and current_user.role in [UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value]
    is_owner = current_user and current_user.id == item.reporter_id
    if not (is_staff or is_owner):
        if item.type == ItemType.FOUND.value and item.identifying_details:
            item.identifying_details = "Private identifying notes are hidden. Provide ownership proof during claim submission."

    return item

@router.post("/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(
    item_in: ItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = Item(
        type=item_in.type.upper(),
        title=item_in.title.strip(),
        category_id=item_in.category_id,
        description=item_in.description.strip(),
        color=item_in.color.strip(),
        brand=item_in.brand.strip() if item_in.brand else None,
        date_occurred=item_in.date_occurred,
        location_id=item_in.location_id,
        specific_location=item_in.specific_location.strip() if item_in.specific_location else None,
        floor=item_in.floor.strip() if item_in.floor else None,
        identifying_details=item_in.identifying_details.strip() if item_in.identifying_details else None,
        storage_location=item_in.storage_location.strip() if item_in.storage_location else None,
        status=ItemStatus.PENDING.value if current_user.role in [UserRole.STUDENT.value, UserRole.FACULTY.value] else ItemStatus.OPEN.value,
        reporter_id=current_user.id,
        is_sensitive=item_in.is_sensitive
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    # Add images if provided
    if item_in.image_urls:
        for idx, img_url in enumerate(item_in.image_urls):
            img = ItemImage(
                item_id=item.id,
                image_url=img_url,
                public_id=f"img_{item.id}_{idx}",
                is_primary=(idx == 0)
            )
            db.add(img)
        db.commit()

    # Log audit
    log = AuditLog(
        user_id=current_user.id,
        action="REPORT_ITEM",
        target_type="item",
        target_id=item.id,
        details=f"User {current_user.email} reported {item.type} item: {item.title}"
    )
    db.add(log)
    db.commit()

    # Trigger smart matching engine automatically!
    try:
        run_matching_for_item(db, item)
    except Exception as e:
        print(f"Error during smart matching calculation: {e}")

    db.refresh(item)
    return item

@router.put("/{item_id}", response_model=ItemResponse)
def update_item(
    item_id: int,
    item_in: ItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    is_staff = current_user.role in [UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value]
    if item.reporter_id != current_user.id and not is_staff:
        raise HTTPException(status_code=403, detail="You do not have permission to edit this item.")

    update_data = item_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(item, field, val)

    db.commit()
    db.refresh(item)

    # Re-evaluate smart matching on update
    try:
        run_matching_for_item(db, item)
    except Exception as e:
        print(f"Matching re-evaluation error: {e}")

    return item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")

    is_staff = current_user.role in [UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value]
    if item.reporter_id != current_user.id and not is_staff:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this item.")

    db.delete(item)
    db.commit()
    return None

@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    contents = await file.read()
    if not validate_image_file(file.filename, len(contents)):
        raise HTTPException(
            status_code=400,
            detail="Invalid image. Allowed formats: JPG, PNG, WEBP. Maximum file size: 5MB."
        )
    
    result = upload_image_bytes(contents, file.filename, folder="campusfind/items")
    return result

@router.get("/cloudinary/signature")
def get_cloudinary_signature(
    folder: str = "campusfind/items",
    current_user: User = Depends(get_current_user)
):
    return generate_signed_upload_params(folder=folder)

@router.get("/media/{file_name}")
def serve_local_media(file_name: str):
    uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "static_uploads")
    safe_path = os.path.abspath(os.path.join(uploads_dir, file_name))
    if not safe_path.startswith(uploads_dir) or not os.path.exists(safe_path):
        raise HTTPException(status_code=404, detail="Image not found.")
    return FileResponse(safe_path)
