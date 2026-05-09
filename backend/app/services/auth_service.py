from sqlalchemy.orm import Session
from datetime import timedelta
from uuid import UUID
from app.models.user_auth.users import User
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.core.config import settings
from app.core.exceptions import UserAlreadyExists, InvalidCredentials
from app.services.redis_manager import save_refresh_token, validate_refresh_token, revoke_user_refresh_tokens

def register_user(db: Session, username: str, email: str, password: str) -> User:
    user_exists = db.query(User).filter((User.username == username) | (User.email == email)).first()
    if user_exists:
        raise UserAlreadyExists("Username or email already registered")
    
    hashed_password = hash_password(password)
    user = User(username=username, email=email, password_hash=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, username: str, password: str) -> User:
    login_id = username.strip()
    user = db.query(User).filter((User.username == login_id) | (User.email == login_id)).first()
    if not user or not verify_password(password, user.password_hash):
        raise InvalidCredentials("Invalid username or password")
    return user

def create_tokens(user_id: UUID) -> dict:
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": str(user_id)}, expires_delta=access_token_expires)

    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(data={"sub": str(user_id)}, expires_delta=refresh_token_expires)

    save_refresh_token(refresh_token)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_in": int(access_token_expires.total_seconds())
    }

def refresh_access_token(refresh_token: str) -> dict:
    user_id = validate_refresh_token(refresh_token)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user_id}, expires_delta=access_token_expires)

    return {
        "access_token": access_token,
        "expires_in": int(access_token_expires.total_seconds())
    }

def logout_user(user_id: UUID) -> bool:
    revoke_user_refresh_tokens(user_id)
    return True
