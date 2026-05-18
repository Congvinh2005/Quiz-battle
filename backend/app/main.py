from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.api.v1.api import api_router
from app.websockets.game_socket import router as websocket_router
import logging
import os

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Quiz Battle API",
    version="1.0.0"
)

# CORS - MUST be first middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")


# Global exception handler to ensure CORS headers are always present
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {type(exc).__name__}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Credentials": "true",
        }
    )

# Create tables on startup
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
    
    # Run Alembic migrations
    try:
        from alembic.config import Config
        from alembic import command
        import os
        
        alembic_cfg = Config(os.path.join(os.path.dirname(__file__), "..", "alembic.ini"))
        alembic_cfg.set_main_option("sqlalchemy.url", str(engine.url))
        command.upgrade(alembic_cfg, "head")
        print("✅ Alembic migrations completed!")
    except Exception as e:
        print(f"⚠️ Alembic migration failed: {e}")

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
