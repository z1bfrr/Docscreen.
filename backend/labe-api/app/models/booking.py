from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.core.database import Base

class CollectionType(str, enum.Enum):
    HOME_COLLECTION = "HOME_COLLECTION"
    WALK_IN = "WALK_IN"

class OrderStatus(str, enum.Enum):
    BOOKED = "BOOKED"
    SAMPLE_COLLECTED = "SAMPLE_COLLECTED"
    PROCESSING = "PROCESSING"
    REPORT_READY = "REPORT_READY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class BookingOrder(Base):
    __tablename__ = "booking_orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    patient_name = Column(String)
    patient_age = Column(Integer)
    patient_gender = Column(String)
    lab_id = Column(Integer, ForeignKey("lab_partners.id"))
    total_amount = Column(Integer)
    collection_type = Column(Enum(CollectionType))
    address = Column(String, nullable=True)
    scheduled_date = Column(String)
    scheduled_time_slot = Column(String)
    status = Column(Enum(OrderStatus), default=OrderStatus.BOOKED)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    lab = relationship("LabPartner", back_populates="orders")
    tests = relationship("OrderTest", back_populates="order")

class OrderTest(Base):
    __tablename__ = "order_tests"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("booking_orders.id"))
    test_id = Column(Integer, ForeignKey("diagnostic_tests.id"))

    order = relationship("BookingOrder", back_populates="tests")
    test = relationship("DiagnosticTest", back_populates="order_tests")
