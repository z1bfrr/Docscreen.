from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class RiskScore(Base):
    __tablename__ = "risk_scores"
    id = Column(Integer, primary_key=True, autoincrement=True)
    analysis_id = Column(String(36), ForeignKey("analysis_results.id"), nullable=False)
    signal_name = Column(String(64))
    weight = Column(Float)
    raw_score = Column(Float)
    weighted_contribution = Column(Float)
    analysis = relationship("AnalysisResult", back_populates="risk_scores")
