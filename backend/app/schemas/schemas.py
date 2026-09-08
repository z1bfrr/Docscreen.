"""
DocScreen — Pydantic Schemas for API Requests and Responses.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class AnalysisResponse(BaseModel):
    analysis_id: str
    document_id: str
    status: str
    risk_score: Optional[int] = None
    risk_label: Optional[str] = None
    document_type: Optional[str] = None
    findings: List[Dict[str, Any]] = []
    ocr_fields: List[Dict[str, Any]] = []
    processing_time_seconds: Optional[float] = None


class ReviewRequest(BaseModel):
    analysis_id: str
    decision: str = Field(..., description="'verified' or 'flagged_fraud'")
    notes: Optional[str] = ""
    reviewer_id: Optional[str] = "officer-default"


class ReviewResponse(BaseModel):
    review_id: str
    analysis_id: str
    decision: str
    status: str
