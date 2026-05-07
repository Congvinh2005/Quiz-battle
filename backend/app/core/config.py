from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:your_secure_password_here@localhost:5432/quiz_battle"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "your_secure_password_here"
    POSTGRES_DB: str = "quiz_battle"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # App Settings
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-change-in-production"

    # JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Quiz Battle"

    # CORS
    ALLOWED_ORIGINS: list = ["http://localhost:3000", "http://localhost:8000"]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
