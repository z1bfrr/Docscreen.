import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.analysis_result import AnalysisResult
from app.models.review import Review

router = APIRouter()


@router.get("/risk-queue")
async def get_risk_queue(db: AsyncSession = Depends(get_db)):
    """Return documents pending review, sorted by risk score desc."""
    stmt = (
        select(AnalysisResult)
        .where(AnalysisResult.review_status == "pending")
        .where(AnalysisResult.status == "complete")
        .order_by(AnalysisResult.risk_score.desc())
    )
    result = await db.execute(stmt)
    analyses = result.scalars().all()

    high = []
    medium = []
    low = []

    for a in analyses:
        item = {
            "analysis_id": a.id,
            "document_id": a.document_id,
            "risk_score": a.risk_score,
            "risk_label": a.risk_label,
            "document_type": a.document_type,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "review_status": a.review_status,
            "top_finding": None,
        }
        if a.risk_label == "HIGH":
            high.append(item)
        elif a.risk_label == "MEDIUM":
            medium.append(item)
        else:
            low.append(item)

    return {"high": high, "medium": medium, "low": low,
            "total": len(analyses)}


@router.post("/review")
async def submit_review(
    analysis_id: str,
    decision: str,
    reviewer: str = "officer_01",
    notes: str = None,
    db: AsyncSession = Depends(get_db),
):
    if decision not in ("approve", "reject", "request_info"):
        raise HTTPException(400, "decision must be: approve | reject | request_info")

    # Get analysis
    stmt = select(AnalysisResult).where(AnalysisResult.id == analysis_id)
    res = await db.execute(stmt)
    analysis = res.scalar_one_or_none()
    if not analysis:
        raise HTTPException(404, "Analysis not found")

    review = Review(
        id=f"REV-{uuid.uuid4().hex[:6].upper()}",
        analysis_id=analysis_id,
        decision=decision,
        reviewer=reviewer,
        notes=notes,
        timestamp=datetime.utcnow(),
    )
    db.add(review)

    # Update review status
    analysis.review_status = decision
    await db.commit()

    return {
        "review_id": review.id,
        "analysis_id": analysis_id,
        "decision": decision,
        "reviewer": reviewer,
        "notes": notes,
        "timestamp": review.timestamp.isoformat(),
    }
