from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryResponse, CategoryCreate
from app.api.deps import require_admin

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name.asc()).all()

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    cat_in: CategoryCreate,
    db: Session = Depends(get_db),
    _admin = Depends(require_admin)
):
    existing = db.query(Category).filter(
        (Category.name == cat_in.name) | (Category.slug == cat_in.slug)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name or slug already exists."
        )
    cat = Category(
        name=cat_in.name,
        slug=cat_in.slug,
        icon=cat_in.icon,
        description=cat_in.description
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat
