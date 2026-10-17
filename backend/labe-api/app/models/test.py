from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class TestCategory(Base):
    __tablename__ = "test_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    icon = Column(String)
    color = Column(String)

    tests = relationship("DiagnosticTest", back_populates="category")


class DiagnosticTest(Base):
    __tablename__ = "diagnostic_tests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    short_name = Column(String)
    category_id = Column(Integer, ForeignKey("test_categories.id"))
    description = Column(String)
    preparation_instructions = Column(String)
    turnaround_time = Column(String)
    sample_type = Column(String)
    parameters = Column(String) # JSON list as string for simplicity, or we can use JSON type
    is_popular = Column(Boolean, default=False)
    is_home_collection_available = Column(Boolean, default=True)

    category = relationship("TestCategory", back_populates="tests")
    lab_prices = relationship("LabTestPrice", back_populates="test")
    order_tests = relationship("OrderTest", back_populates="test")


class HealthPackage(Base):
    __tablename__ = "health_packages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    tests_included = Column(String) # Comma separated for simplicity
    original_price = Column(Integer)
    discounted_price = Column(Integer)
    discount_percent = Column(Integer)
    is_bestseller = Column(Boolean, default=False)
