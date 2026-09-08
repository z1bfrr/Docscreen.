from sqlalchemy import Column, String, Float, Integer, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Finding(Base):
    __tablename__ = "findings"
    id = Column(Integer, primary_key=True, autoincrement=True)
    analysis_id = Column(String(36), ForeignKey("analysis_results.id"), nullable=False)
    source = Column(String(64))
    finding_type = Column(String(64))
    severity = Column(String(16))
    score = Column(Float)
    confidence = Column(Float)
    description = Column(String(512))
    evidence = Column(JSON)
    rule_id = Column(String(32))
    analysis = relationship("AnalysisResult", back_populates="findings")
