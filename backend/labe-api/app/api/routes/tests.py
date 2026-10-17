from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api.deps import get_db
from app.models.test import DiagnosticTest, TestCategory, HealthPackage
from app.schemas.test import DiagnosticTestResponse, TestCategoryResponse, HealthPackageResponse

router = APIRouter()

@router.get("/categories", response_model=List[TestCategoryResponse])
async def get_categories(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    stmt = select(TestCategory).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/tests", response_model=List[DiagnosticTestResponse])
async def get_tests(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    category_id: int = None
) -> Any:
    stmt = select(DiagnosticTest).options(selectinload(DiagnosticTest.category))
    if category_id:
        stmt = stmt.where(DiagnosticTest.category_id == category_id)
    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/tests/popular", response_model=List[DiagnosticTestResponse])
async def get_popular_tests(
    db: AsyncSession = Depends(get_db),
    limit: int = 10
) -> Any:
    stmt = select(DiagnosticTest).options(selectinload(DiagnosticTest.category)).where(DiagnosticTest.is_popular == True).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/tests/{test_id}", response_model=DiagnosticTestResponse)
async def get_test(
    test_id: int,
    db: AsyncSession = Depends(get_db)
) -> Any:
    stmt = select(DiagnosticTest).options(selectinload(DiagnosticTest.category)).where(DiagnosticTest.id == test_id)
    result = await db.execute(stmt)
    test = result.scalar_one_or_none()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return test

@router.get("/packages", response_model=List[HealthPackageResponse])
async def get_packages(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    stmt = select(HealthPackage).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()
