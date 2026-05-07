from sqlalchemy.orm import Session
from datetime import timedelta, datetime, timezone
from uuid import UUID
from app.models.user_auth.users import User
from app.models.user_auth.refresh_tokens import RefreshToken
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.config import settings
from app.core.exceptions import UserAlreadyExists, InvalidCredentials, InvalidToken, TokenExpired

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
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.password_hash):
        raise InvalidCredentials("Invalid username or password")
    return user

def create_tokens(db: Session, user_id: UUID) -> dict:
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": str(user_id)}, expires_delta=access_token_expires)

    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(data={"sub": str(user_id)}, expires_delta=refresh_token_expires)

    expires_at = datetime.now(timezone.utc) + refresh_token_expires
    db_refresh_token = RefreshToken(user_id=user_id, token=refresh_token, expires_at=expires_at)
    db.add(db_refresh_token)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_in": int(access_token_expires.total_seconds())
    }

def refresh_access_token(db: Session, refresh_token: str) -> dict:
    payload = decode_token(refresh_token)
    if not payload:
        raise InvalidToken("Invalid refresh token")

    user_id = payload.get("sub")
    if not user_id:
        raise InvalidToken("Invalid token payload")

    db_token = db.query(RefreshToken).filter(
        (RefreshToken.token == refresh_token) & (RefreshToken.user_id == UUID(user_id))
    ).first()

    if not db_token:
        raise InvalidToken("Refresh token not found")

    expires_at = db_token.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        db.delete(db_token)
        db.commit()
        raise TokenExpired("Refresh token expired")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user_id}, expires_delta=access_token_expires)

    return {
        "access_token": access_token,
        "expires_in": int(access_token_expires.total_seconds())
    }

def logout_user(db: Session, user_id: UUID) -> bool:
    db.query(RefreshToken).filter(RefreshToken.user_id == user_id).delete()
    db.commit()
    print(f"User {user_id} logged out, all refresh tokens invalidated")
    return True
