from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class LabPartner(Base):
    __tablename__ = "lab_partners"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address = Column(String)
    city = Column(String)
    distance = Column(String)
    rating = Column(Float)
    review_count = Column(Integer)
    is_nabl_certified = Column(Boolean, default=False)
    is_cap_certified = Column(Boolean, default=False)
    operating_hours = Column(String)
    home_collection_charge = Column(Integer)

    test_prices = relationship("LabTestPrice", back_populates="lab")
    orders = relationship("BookingOrder", back_populates="lab")


class LabTestPrice(Base):
    __tablename__ = "lab_test_prices"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("diagnostic_tests.id"))
    lab_id = Column(Integer, ForeignKey("lab_partners.id"))
    price = Column(Integer)
    discount_percent = Column(Integer, default=0)

    test = relationship("DiagnosticTest", back_populates="lab_prices")
    lab = relationship("LabPartner", back_populates="test_prices")
