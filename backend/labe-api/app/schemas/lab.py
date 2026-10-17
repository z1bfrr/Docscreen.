from pydantic import BaseModel
from typing import Optional

class LabPartnerBase(BaseModel):
    name: str
    address: str
    city: str
    distance: str
    rating: float
    review_count: int
    is_nabl_certified: bool = False
    is_cap_certified: bool = False
    operating_hours: str
    home_collection_charge: int

class LabPartnerResponse(LabPartnerBase):
    id: int

    class Config:
        from_attributes = True

class LabTestPriceBase(BaseModel):
    test_id: int
    lab_id: int
    price: int
    discount_percent: int = 0

class LabTestPriceResponse(LabTestPriceBase):
    id: int

    class Config:
        from_attributes = True
