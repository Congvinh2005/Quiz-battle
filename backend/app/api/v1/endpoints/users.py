from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.core.security import hash_password, verify_password
from app.models.user_auth.users import User

router = APIRouter(prefix="/users", tags=["users"])


def _serialize_user(user: User):
    return {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }


@router.get("/", response_model=list)
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [_serialize_user(user) for user in users]


@router.get("/me", response_model=dict)
def read_me(current_user: UUID = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return _serialize_user(user)


@router.put("/me", response_model=dict)
def update_me(payload: dict, current_user: UUID = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    username = str(payload.get("username") or "").strip()
    email = str(payload.get("email") or "").strip().lower()

    if not username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username is required")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is required")

    existing_username = db.query(User).filter(User.username == username, User.id != current_user).first()
    if existing_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")

    existing_email = db.query(User).filter(User.email == email, User.id != current_user).first()
    if existing_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    user.username = username
    user.email = email
    db.commit()
    db.refresh(user)
    return _serialize_user(user)


@router.put("/me/password", response_model=dict)
def update_my_password(payload: dict, current_user: UUID = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    current_password = str(payload.get("current_password") or "")
    new_password = str(payload.get("new_password") or "")

    if not current_password or not new_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current and new password are required")
    if len(new_password) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be at least 6 characters")
    if not verify_password(current_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    user.password_hash = hash_password(new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@router.get("/{user_id}", response_model=dict)
def get_user(user_id: UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return _serialize_user(user)
