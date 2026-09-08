from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Review(Base):
    __tablename__ = "reviews"
    id = Column(String(36), primary_key=True)
    analysis_id = Column(String(36), ForeignKey("analysis_results.id"), nullable=False)
    decision = Column(String(32))
    reviewer = Column(String(128))
    notes = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    analysis = relationship("AnalysisResult", back_populates="reviews")
