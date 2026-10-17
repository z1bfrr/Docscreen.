from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api.deps import get_db
from app.models.lab import LabPartner, LabTestPrice
from app.schemas.lab import LabPartnerResponse, LabTestPriceResponse

router = APIRouter()

@router.get("/", response_model=List[LabPartnerResponse])
async def get_labs(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    stmt = select(LabPartner).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{lab_id}", response_model=LabPartnerResponse)
async def get_lab(
    lab_id: int,
    db: AsyncSession = Depends(get_db)
) -> Any:
    stmt = select(LabPartner).where(LabPartner.id == lab_id)
    result = await db.execute(stmt)
    lab = result.scalar_one_or_none()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    return lab

@router.get("/{lab_id}/prices", response_model=List[LabTestPriceResponse])
async def get_lab_prices(
    lab_id: int,
    db: AsyncSession = Depends(get_db)
) -> Any:
    stmt = select(LabTestPrice).where(LabTestPrice.lab_id == lab_id)
    result = await db.execute(stmt)
    return result.scalars().all()
