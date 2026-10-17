from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class CollectionType(str, Enum):
    HOME_COLLECTION = "HOME_COLLECTION"
    WALK_IN = "WALK_IN"

class OrderStatus(str, Enum):
    BOOKED = "BOOKED"
    SAMPLE_COLLECTED = "SAMPLE_COLLECTED"
    PROCESSING = "PROCESSING"
    REPORT_READY = "REPORT_READY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class BookingOrderBase(BaseModel):
    patient_name: str
    patient_age: int
    patient_gender: str
    lab_id: int
    total_amount: int
    collection_type: CollectionType
    address: Optional[str] = None
    scheduled_date: str
    scheduled_time_slot: str

class BookingOrderCreate(BookingOrderBase):
    test_ids: List[int]

class BookingOrderResponse(BookingOrderBase):
    id: int
    user_id: int
    status: OrderStatus
    created_at: datetime

    class Config:
        from_attributes = True
