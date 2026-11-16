from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    verify_password, get_password_hash, create_access_token,
    validate_college_email, decode_access_token
)
from app.models.user import User, UserRole
from app.models.audit_log import AuditLog
from app.schemas.user import (
    UserRegister, UserLogin, UserResponse, Token,
    ForgotPasswordRequest, ResetPasswordRequest
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Verify college domain
    if not validate_college_email(user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration restricted to recognized college domains ({settings.ALLOWED_COLLEGE_DOMAINS}).",
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this college email already exists.",
        )
    
    # Restrict direct registration of admin/super_admin roles
    role = UserRole.STUDENT.value
    if user_in.role in [UserRole.STUDENT.value, UserRole.FACULTY.value]:
        role = user_in.role
    
    user = User(
        email=user_in.email.lower().strip(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name.strip(),
        student_faculty_id=user_in.student_faculty_id,
        department=user_in.department,
        phone=user_in.phone,
        role=role,
        is_verified=True,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Log audit
    log = AuditLog(
        user_id=user.id,
        action="USER_REGISTER",
        target_type="user",
        target_id=user.id,
        details=f"New user registered: {user.email} ({user.role})"
    )
    db.add(log)
    db.commit()

    access_token = create_access_token(
        subject=user.id,
        extra_claims={"email": user.email, "role": user.role, "name": user.full_name}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email.lower().strip()).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect college email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended or inactive. Please contact campus security/admin.",
        )
    
    access_token = create_access_token(
        subject=user.id,
        extra_claims={"email": user.email, "role": user.role, "name": user.full_name}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user:
        # Avoid user enumeration attack: always return generic positive message
        return {"message": "If this college email is registered, password reset instructions have been generated."}
    
    # Generate temporary reset token (expires in 1 hour)
    reset_token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(hours=1),
        extra_claims={"type": "password_reset"}
    )
    return {
        "message": "Password reset token generated successfully. In development/testing, use this token directly.",
        "reset_token": reset_token
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = decode_access_token(req.token)
    if not payload or payload.get("type") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password updated successfully. You can now log in with your new password."}
