from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.document import Document
from app.models.analysis_result import AnalysisResult

router = APIRouter()


@router.get("/documents")
async def list_documents(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    risk_label: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * per_page
    stmt = (
        select(Document, AnalysisResult)
        .join(AnalysisResult, AnalysisResult.document_id == Document.id, isouter=True)
        .order_by(Document.created_at.desc())
        .offset(offset)
        .limit(per_page)
    )
    if risk_label:
        stmt = stmt.where(AnalysisResult.risk_label == risk_label.upper())

    result = await db.execute(stmt)
    rows = result.all()

    docs = []
    for doc, analysis in rows:
        docs.append({
            "id": doc.id,
            "original_filename": doc.original_filename,
            "mime_type": doc.mime_type,
            "file_size": doc.file_size,
            "created_at": doc.created_at.isoformat() if doc.created_at else None,
            "risk_score": analysis.risk_score if analysis else None,
            "risk_label": analysis.risk_label if analysis else None,
            "document_type": analysis.document_type if analysis else None,
            "review_status": analysis.review_status if analysis else None,
            "analysis_id": analysis.id if analysis else None,
        })

    # Total count
    count_stmt = select(func.count()).select_from(Document)
    total = (await db.execute(count_stmt)).scalar()

    return {"documents": docs, "total": total, "page": page, "per_page": per_page}


@router.get("/documents/{document_id}")
async def get_document(document_id: str, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Document, AnalysisResult)
        .join(AnalysisResult, AnalysisResult.document_id == Document.id, isouter=True)
        .where(Document.id == document_id)
    )
    result = await db.execute(stmt)
    row = result.first()
    if not row:
        raise HTTPException(404, "Document not found")

    doc, analysis = row
    return {
        "id": doc.id,
        "original_filename": doc.original_filename,
        "file_size": doc.file_size,
        "mime_type": doc.mime_type,
        "sha256": doc.sha256,
        "width": doc.width,
        "height": doc.height,
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
        "analysis": {c.name: getattr(analysis, c.name)
                     for c in analysis.__table__.columns} if analysis else None,
    }
