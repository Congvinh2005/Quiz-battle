from sqlalchemy import Column, DateTime, func
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class BaseModel(Base):
    """Base class cho tất cả models"""
    __abstract__ = True

    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
