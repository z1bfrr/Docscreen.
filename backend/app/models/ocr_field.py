from sqlalchemy import Column, String, Float, Integer, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class OcrField(Base):
    __tablename__ = "ocr_fields"
    id = Column(Integer, primary_key=True, autoincrement=True)
    analysis_id = Column(String(36), ForeignKey("analysis_results.id"), nullable=False)
    field_name = Column(String(64), nullable=False)
    value = Column(String(512))
    confidence = Column(Float)
    bbox = Column(JSON)
    analysis = relationship("AnalysisResult", back_populates="ocr_fields")
