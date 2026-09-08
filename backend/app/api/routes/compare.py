"""
DocScreen — Document Analysis Comparison Endpoint.
Compares two analyses side-by-side, generating field-by-field diffs.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any, List

from app.core.database import get_db
from app.models.analysis_result import AnalysisResult
from app.models.ocr_field import OcrField

router = APIRouter()


@router.post("/compare")
async def compare_documents(
    analysis_id_a: str = Query(..., description="First analysis ID"),
    analysis_id_b: str = Query(..., description="Second analysis ID"),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Compare two analysis results side-by-side.
    """
    # Fetch analyses
    res_a = await db.execute(select(AnalysisResult).where(AnalysisResult.id == analysis_id_a))
    a = res_a.scalar_one_or_none()

    res_b = await db.execute(select(AnalysisResult).where(AnalysisResult.id == analysis_id_b))
    b = res_b.scalar_one_or_none()

    if not a:
        raise HTTPException(status_code=404, detail=f"Analysis {analysis_id_a} not found")
    if not b:
        raise HTTPException(status_code=404, detail=f"Analysis {analysis_id_b} not found")

    # Fetch OCR fields for both
    res_fields_a = await db.execute(select(OcrField).where(OcrField.analysis_id == analysis_id_a))
    fields_a = {f.field_name: f.value for f in res_fields_a.scalars().all()}

    res_fields_b = await db.execute(select(OcrField).where(OcrField.analysis_id == analysis_id_b))
    fields_b = {f.field_name: f.value for f in res_fields_b.scalars().all()}

    # Metadata comparisons
    comparison: List[Dict[str, Any]] = [
        {
            "field": "document_type",
            "value_a": a.document_type or "Unknown",
            "value_b": b.document_type or "Unknown",
            "match": (a.document_type == b.document_type) if (a.document_type and b.document_type) else None
        },
        {
            "field": "risk_score",
            "value_a": a.risk_score,
            "value_b": b.risk_score,
            "match": a.risk_score == b.risk_score
        },
        {
            "field": "risk_label",
            "value_a": a.risk_label,
            "value_b": b.risk_label,
            "match": a.risk_label == b.risk_label
        },
        {
            "field": "quality_score",
            "value_a": a.quality_score,
            "value_b": b.quality_score,
            "match": abs((a.quality_score or 0) - (b.quality_score or 0)) < 10
        },
        {
            "field": "tamper_score",
            "value_a": a.tamper_score,
            "value_b": b.tamper_score,
            "match": abs((a.tamper_score or 0) - (b.tamper_score or 0)) < 0.15
        },
    ]

    # Combine extracted OCR fields
    all_field_names = sorted(list(set(fields_a.keys()).union(set(fields_b.keys()))))
    for fname in all_field_names:
        va = fields_a.get(fname)
        vb = fields_b.get(fname)
        
        is_match = None
        if va is not None and vb is not None:
            # Normalized match
            is_match = (va.strip().lower() == vb.strip().lower())

        comparison.append({
            "field": fname,
            "value_a": va,
            "value_b": vb,
            "match": is_match
        })

    return {
        "analysis_a": analysis_id_a,
        "analysis_b": analysis_id_b,
        "comparison": comparison,
    }
