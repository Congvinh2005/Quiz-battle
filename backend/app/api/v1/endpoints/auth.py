from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.session import get_db
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, TokenRefresh, UserResponse, AccessTokenResponse
from app.services.auth_service import register_user, authenticate_user, create_tokens, refresh_access_token, logout_user
from app.api.dependencies import get_current_user
from app.models.user_auth.users import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    user = register_user(db, user_data.username, user_data.email, user_data.password)
    tokens = create_tokens(user.id)

    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        expires_in=tokens["expires_in"]
    )

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, credentials.username, credentials.password)
    tokens = create_tokens(user.id)

    return TokenResponse(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        expires_in=tokens["expires_in"]
    )

@router.get("/me", response_model=UserResponse)
def me(current_user: UUID = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user).first()
    return UserResponse.from_orm(user)

@router.post("/refresh", response_model=AccessTokenResponse)
def refresh(data: TokenRefresh):
    tokens = refresh_access_token(data.refresh_token)

    return AccessTokenResponse(
        access_token=tokens["access_token"],
        expires_in=tokens["expires_in"]
    )

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(current_user: UUID = Depends(get_current_user)):
    logout_user(current_user)
    return None
