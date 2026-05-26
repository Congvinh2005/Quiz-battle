from sqlalchemy.orm import Session
from datetime import timedelta
from uuid import UUID
from app.models.user_auth.users import User
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.core.config import settings
from app.core.exceptions import UserAlreadyExists, InvalidCredentials
from app.services.redis_manager import save_refresh_token, validate_refresh_token, revoke_user_refresh_tokens

def register_user(db: Session, username: str, email: str, password: str, full_name: str | None = None) -> User:
    username = username.strip()
    email = email.strip()

    username_exists = db.query(User).filter(User.username == username).first()
    if username_exists:
        raise UserAlreadyExists("Tên tài khoản đã được sử dụng")

    email_exists = db.query(User).filter(User.email == email).first()
    if email_exists:
        raise UserAlreadyExists("Email đã được đăng ký")
    
    hashed_password = hash_password(password)
    user = User(
        username=username,
        full_name=(full_name or "").strip() or None,
        email=email,
        password_hash=hashed_password,
    )
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

async def authenticate_google_user(db: Session, code: str) -> User:
    import httpx
    from uuid import uuid4
    from fastapi import HTTPException
    
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=400,
            detail="Google OAuth is not configured on the server."
        )

    # 1. Exchange authorization code for token
    async with httpx.AsyncClient() as client:
        try:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code",
                },
                timeout=10.0
            )
            token_data = token_response.json()
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to communicate with Google token endpoint: {str(e)}"
            )

        if token_response.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail=token_data.get("error_description") or token_data.get("error") or "Failed to exchange Google OAuth code."
            )

        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="No access token received from Google.")

        # 2. Get user info from Google
        try:
            userinfo_response = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=10.0
            )
            user_info = userinfo_response.json()
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to fetch user info from Google: {str(e)}"
            )

        if userinfo_response.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail="Failed to fetch user info from Google."
            )

    email = user_info.get("email")
    full_name = user_info.get("name")
    avatar_url = user_info.get("picture")

    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email address associated.")

    # 3. Check if user exists
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # If user exists, update avatar_url if it changed or was empty
        if avatar_url and (not user.avatar_url or user.avatar_url != avatar_url):
            user.avatar_url = avatar_url
            db.commit()
            db.refresh(user)
        return user
    
    # 4. Create new user if not exists
    base_username = email.split("@")[0].strip()
    if len(base_username) < 3:
        base_username = base_username + "123"
    base_username = base_username[:45]
    
    username = base_username
    while db.query(User).filter(User.username == username).first() is not None:
        username = f"{base_username}_{str(uuid4())[:4]}"
        
    random_password = str(uuid4())
    hashed_password = hash_password(random_password)
    
    user = User(
        username=username,
        email=email,
        full_name=full_name.strip() if full_name else None,
        avatar_url=avatar_url,
        password_hash=hashed_password,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

