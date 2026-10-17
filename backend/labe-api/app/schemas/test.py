from pydantic import BaseModel
from typing import List, Optional

class TestCategoryBase(BaseModel):
    name: str
    icon: str
    color: str

class TestCategoryResponse(TestCategoryBase):
    id: int

    class Config:
        from_attributes = True

class DiagnosticTestBase(BaseModel):
    name: str
    short_name: str
    category_id: int
    description: str
    preparation_instructions: str
    turnaround_time: str
    sample_type: str
    parameters: str
    is_popular: bool = False
    is_home_collection_available: bool = True

class DiagnosticTestResponse(DiagnosticTestBase):
    id: int
    category: Optional[TestCategoryResponse] = None

    class Config:
        from_attributes = True

class HealthPackageBase(BaseModel):
    name: str
    description: str
    tests_included: str
    original_price: int
    discounted_price: int
    discount_percent: int
    is_bestseller: bool = False

class HealthPackageResponse(HealthPackageBase):
    id: int

    class Config:
        from_attributes = True
