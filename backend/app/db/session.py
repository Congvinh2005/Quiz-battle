from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # Log SQL statements if DEBUG is True
    pool_pre_ping=True,   # Verify connections before using them
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    """Dependency to get database session in FastAPI endpoints"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
