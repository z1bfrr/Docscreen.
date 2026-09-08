from sqlalchemy import Column, String, JSON
from app.core.database import Base

class Template(Base):
    __tablename__ = "templates"
    id = Column(String(64), primary_key=True)
    name = Column(String(128))
    document_type = Column(String(128))
    keywords = Column(JSON)
    regions = Column(JSON)
    id_pattern = Column(String(256))
    aspect_ratio_min = Column(String(16))
    aspect_ratio_max = Column(String(16))
