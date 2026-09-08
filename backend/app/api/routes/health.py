from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.config import settings
from app.core.database import get_db
from app.anomaly.isolation_forest import is_model_loaded
from app.ocr.tesseract_engine import ocr_engine_status
from pathlib import Path

router = APIRouter()


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    # DB check
    db_ok = False
    try:
        await db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        pass

    ocr_status = ocr_engine_status()
    demo_path = settings.demo_docs_path
    demo_count = len(list(demo_path.glob("*.jpg"))) if demo_path.exists() else 0

    return {
        "status": "ok" if db_ok else "degraded",
        "ocr_engine": ocr_status.get("primary_engine", "cv_fallback"),
        "ml_model_loaded": is_model_loaded(),
        "db_connected": db_ok,
        "pipeline_version": settings.PIPELINE_VERSION,
        "model_version": settings.MODEL_VERSION,
        "demo_docs_available": demo_count,
    }
