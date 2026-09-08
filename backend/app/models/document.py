from sqlalchemy import Column, String, Integer, BigInteger, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"
    id = Column(String(36), primary_key=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    sha256 = Column(String(64), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    mime_type = Column(String(64), nullable=False)
    upload_path = Column(String(512), nullable=False)
    page_count = Column(Integer, default=1)
    width = Column(Integer)
    height = Column(Integer)
    exif_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    analysis = relationship("AnalysisResult", back_populates="document", uselist=False)
