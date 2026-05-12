from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.api.v1.api import api_router
from app.websockets.game_socket import router as websocket_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Quiz Battle API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

# Include routers
app.include_router(api_router)
app.include_router(websocket_router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Quiz Battle API",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
