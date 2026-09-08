"""
DocScreen — AI Document Screening System (SIH 2026)
FastAPI application entry point.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.core.config import settings
from app.core.database import init_db
from app.anomaly.isolation_forest import load_model
from app.api.routes import analyze, documents, review, analytics, demo, health, compare

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB, load ML model, pre-warm OCR."""
    logger.info("Starting DocScreen API...")

    # Create upload directory
    settings.upload_path.mkdir(parents=True, exist_ok=True)
    settings.model_path.parent.mkdir(parents=True, exist_ok=True)

    # Init database
    await init_db()
    logger.info("Database initialized")

    # Load ML model
    loaded = load_model()
    logger.info(f"ML model loaded: {loaded}")

    # Pre-import OCR engine to trigger availability check
    from app.ocr.tesseract_engine import ocr_engine_status
    status = ocr_engine_status()
    logger.info(f"OCR engines: {status}")

    yield

    logger.info("Shutting down DocScreen API")


app = FastAPI(
    title="DocScreen — AI Document Screening",
    description="Multi-layer AI document screening and risk engine for SIH 2026",
    version=settings.PIPELINE_VERSION,
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vercel frontend + local dev — restrict post-MVP
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files (forensic heatmaps) ─────────────────────────────────────────
uploads_path = Path(settings.UPLOAD_DIR)
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(analyze.router, prefix="/api", tags=["Analysis"])
app.include_router(documents.router, prefix="/api", tags=["Documents"])
app.include_router(review.router, prefix="/api", tags=["Review"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(demo.router, prefix="/api", tags=["Demo"])
app.include_router(compare.router, prefix="/api", tags=["Compare"])
app.include_router(health.router, prefix="/api", tags=["System"])


@app.get("/")
async def root():
    return {
        "system": "DocScreen — AI Document Screening",
        "version": settings.PIPELINE_VERSION,
        "docs": "/docs",
        "health": "/api/health",
    }
