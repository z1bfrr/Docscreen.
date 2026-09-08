import uuid
import hashlib
import shutil
import logging
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import aiofiles

from app.core.config import settings
from app.core.database import get_db
from app.models.document import Document
from app.models.analysis_result import AnalysisResult
from app.models.ocr_field import OcrField
from app.models.finding import Finding
from app.models.risk_score import RiskScore

logger = logging.getLogger(__name__)
router = APIRouter()

ALLOWED_MIME = {"image/jpeg", "image/png", "image/jpg", "application/pdf"}
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".pdf"}
MAX_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


async def _process_and_store(
    document_id: str, image_bytes: bytes, filename: str, mime_type: str
):
    """Background task: run pipeline and save result to DB.
    Uses its own DB session — the request-scoped session is closed before this runs.
    """
    from app.pipelines.analysis_pipeline import run_pipeline
    from app.core.database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        # Mark as running
        stmt = select(AnalysisResult).where(AnalysisResult.document_id == document_id)
        res = await db.execute(stmt)
        analysis = res.scalar_one_or_none()
        if analysis:
            analysis.status = "running"
            await db.commit()

        try:
            pipeline_result = await run_pipeline(image_bytes, filename, mime_type, document_id)

            if analysis:
                analysis.status = pipeline_result.get("status", "complete")
                analysis.document_type = pipeline_result.get("document_type")
                analysis.classification_confidence = pipeline_result.get("classification_confidence")
                analysis.matched_template = pipeline_result.get("matched_template")
                analysis.quality_score = pipeline_result.get("quality", {}).get("quality_score")
                analysis.quality_details = pipeline_result.get("quality")
                analysis.ocr_status = pipeline_result.get("ocr_status")
                analysis.ocr_avg_confidence = pipeline_result.get("ocr_avg_confidence")
                analysis.template_similarity = pipeline_result.get("template_similarity")
                analysis.layout_details = pipeline_result.get("layout_details")
                analysis.tamper_score = pipeline_result.get("tamper_score")
                analysis.tamper_details = pipeline_result.get("tamper_details")
                analysis.forensic_heatmap_path = pipeline_result.get("forensic_heatmap_path")
                analysis.qr_status = pipeline_result.get("qr_status")
                analysis.qr_details = pipeline_result.get("qr_details")
                analysis.anomaly_score = pipeline_result.get("anomaly_score")
                analysis.anomaly_label = pipeline_result.get("anomaly_label")
                analysis.risk_score = pipeline_result.get("risk_score")
                analysis.risk_label = pipeline_result.get("risk_label")
                analysis.risk_breakdown = pipeline_result.get("risk_breakdown")
                analysis.metadata_anomaly_score = pipeline_result.get("metadata_anomaly_score")
                analysis.metadata_details = pipeline_result.get("metadata_details")
                analysis.consistency_details = pipeline_result.get("consistency_details")
                analysis.pipeline_version = pipeline_result.get("pipeline_version")
                analysis.model_version = pipeline_result.get("model_version")
                analysis.analysis_steps = pipeline_result.get("analysis_steps")
                analysis.review_status = "pending" if pipeline_result.get("risk_label") in ("MEDIUM", "HIGH") else "clear"
                analysis.completed_at = datetime.utcnow()

                # OCR Fields
                for field in pipeline_result.get("ocr_fields", []):
                    ocr_field = OcrField(
                        analysis_id=analysis.id,
                        field_name=field["field_name"],
                        value=field.get("value"),
                        confidence=field.get("confidence"),
                        bbox=field.get("bbox"),
                    )
                    db.add(ocr_field)

                # Findings
                for f in pipeline_result.get("findings", []):
                    finding = Finding(
                        analysis_id=analysis.id,
                        source=f.get("source"),
                        finding_type=f.get("finding_type"),
                        severity=f.get("severity"),
                        score=f.get("score"),
                        confidence=f.get("confidence"),
                        description=f.get("description"),
                        evidence=f.get("evidence"),
                        rule_id=f.get("rule_id"),
                    )
                    db.add(finding)

                # Risk breakdown
                for rb in pipeline_result.get("risk_breakdown", []):
                    rs = RiskScore(
                        analysis_id=analysis.id,
                        signal_name=rb.get("signal"),
                        weight=rb.get("weight"),
                        raw_score=rb.get("raw_score"),
                        weighted_contribution=rb.get("contribution"),
                    )
                    db.add(rs)

                await db.commit()

        except Exception as e:
            logger.error(f"Pipeline error for doc {document_id}: {e}", exc_info=True)
            if analysis:
                analysis.status = "error"
                analysis.error_message = str(e)[:500]
                await db.commit()


@router.post("/analyze")
async def analyze_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    # Validate file type
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, f"Unsupported file type: {ext}. Allowed: {ALLOWED_EXT}")

    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_MIME and not content_type.startswith("image/"):
        raise HTTPException(400, f"Unsupported MIME type: {content_type}")

    # Read file
    image_bytes = await file.read()
    if len(image_bytes) > MAX_BYTES:
        raise HTTPException(413, f"File too large. Max {settings.MAX_UPLOAD_SIZE_MB}MB")
    if len(image_bytes) == 0:
        raise HTTPException(400, "Empty file")

    # Hash + unique ID
    sha256 = hashlib.sha256(image_bytes).hexdigest()
    doc_id = str(uuid.uuid4())
    safe_name = f"{doc_id}{ext}"

    # Save file
    settings.upload_path.mkdir(parents=True, exist_ok=True)
    file_path = settings.upload_path / safe_name
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(image_bytes)

    # Get dimensions
    try:
        from PIL import Image as PILImage
        import io
        pil = PILImage.open(io.BytesIO(image_bytes))
        w, h = pil.width, pil.height
    except Exception:
        w, h = 0, 0

    # Create DB records
    doc = Document(
        id=doc_id,
        filename=safe_name,
        original_filename=file.filename,
        sha256=sha256,
        file_size=len(image_bytes),
        mime_type=content_type,
        upload_path=str(file_path),
        width=w,
        height=h,
    )
    db.add(doc)

    analysis_id = f"ANA-{uuid.uuid4().hex[:8].upper()}"
    analysis = AnalysisResult(
        id=analysis_id,
        document_id=doc_id,
        status="pending",
        pipeline_version=settings.PIPELINE_VERSION,
        model_version=settings.MODEL_VERSION,
    )
    db.add(analysis)
    await db.commit()

    # Run pipeline in background — use independent session (request session closes on response)
    background_tasks.add_task(_process_and_store, doc_id, image_bytes, file.filename, content_type)

    return {
        "analysis_id": analysis_id,
        "document_id": doc_id,
        "status": "processing",
        "message": "Document received. Analysis running.",
    }


@router.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(AnalysisResult).where(AnalysisResult.id == analysis_id)
    res = await db.execute(stmt)
    analysis = res.scalar_one_or_none()
    if not analysis:
        raise HTTPException(404, "Analysis not found")

    # Load related data
    ocr_stmt = select(OcrField).where(OcrField.analysis_id == analysis_id)
    ocr_res = await db.execute(ocr_stmt)
    ocr_fields = ocr_res.scalars().all()

    finding_stmt = select(Finding).where(Finding.analysis_id == analysis_id)
    finding_res = await db.execute(finding_stmt)
    findings = finding_res.scalars().all()

    def _to_dict(obj):
        if hasattr(obj, "__table__"):
            return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}
        return obj

    return {
        **_to_dict(analysis),
        "ocr_fields": [_to_dict(f) for f in ocr_fields],
        "findings": [_to_dict(f) for f in findings],
    }
