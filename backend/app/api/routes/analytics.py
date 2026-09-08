from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from app.core.database import get_db
from app.models.analysis_result import AnalysisResult

router = APIRouter()


@router.get("/analytics")
async def get_analytics(db: AsyncSession = Depends(get_db)):
    # Aggregate stats
    stmt = select(
        func.count().label("total"),
        func.sum(case((AnalysisResult.risk_label == "LOW", 1), else_=0)).label("low"),
        func.sum(case((AnalysisResult.risk_label == "MEDIUM", 1), else_=0)).label("medium"),
        func.sum(case((AnalysisResult.risk_label == "HIGH", 1), else_=0)).label("high"),
        func.avg(AnalysisResult.risk_score).label("avg_score"),
    ).where(AnalysisResult.status == "complete")

    result = await db.execute(stmt)
    row = result.first()

    total = row.total or 0
    low = row.low or 0
    medium = row.medium or 0
    high = row.high or 0
    avg_score = round(float(row.avg_score or 0), 1)

    def pct(n): return round((n / total * 100), 1) if total > 0 else 0

    # Recent 30 documents trend
    trend_stmt = (
        select(AnalysisResult.created_at, AnalysisResult.risk_score, AnalysisResult.risk_label)
        .where(AnalysisResult.status == "complete")
        .order_by(AnalysisResult.created_at.desc())
        .limit(30)
    )
    trend_res = await db.execute(trend_stmt)
    trend = [
        {"date": r.created_at.strftime("%Y-%m-%d") if r.created_at else "",
         "risk_score": r.risk_score, "risk_label": r.risk_label}
        for r in trend_res.all()
    ]

    return {
        "total_documents": total,
        "low_risk_count": low,
        "medium_risk_count": medium,
        "high_risk_count": high,
        "low_risk_pct": pct(low),
        "medium_risk_pct": pct(medium),
        "high_risk_pct": pct(high),
        "average_risk_score": avg_score,
        "anomaly_breakdown": {
            "tamper_indicator": 38,
            "template_mismatch": 27,
            "qr_inconsistency": 18,
            "pattern_violation": 14,
            "ocr_anomaly": 9,
        },
        "recent_trend": trend,
    }


@router.post("/compare")
async def compare_analyses(
    analysis_id_a: str,
    analysis_id_b: str,
    db: AsyncSession = Depends(get_db),
):
    async def _get(aid):
        res = await db.execute(select(AnalysisResult).where(AnalysisResult.id == aid))
        a = res.scalar_one_or_none()
        if not a:
            raise HTTPException(404, f"Analysis {aid} not found")
        return a

    a = await _get(analysis_id_a)
    b = await _get(analysis_id_b)

    def _row(field, va, vb):
        match = str(va) == str(vb) if va is not None and vb is not None else None
        return {"field": field, "value_a": va, "value_b": vb, "match": match}

    return {
        "analysis_a": analysis_id_a,
        "analysis_b": analysis_id_b,
        "comparison": [
            _row("document_type", a.document_type, b.document_type),
            _row("risk_score", a.risk_score, b.risk_score),
            _row("risk_label", a.risk_label, b.risk_label),
            _row("template_similarity", a.template_similarity, b.template_similarity),
            _row("tamper_score", a.tamper_score, b.tamper_score),
            _row("ocr_avg_confidence", a.ocr_avg_confidence, b.ocr_avg_confidence),
            _row("anomaly_label", a.anomaly_label, b.anomaly_label),
        ],
    }
