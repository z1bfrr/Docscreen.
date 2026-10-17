from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.booking import BookingOrder, OrderTest, OrderStatus
from app.schemas.booking import BookingOrderCreate, BookingOrderResponse

router = APIRouter()

@router.post("/", response_model=BookingOrderResponse)
async def create_booking(
    order_in: BookingOrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Create the order
    order = BookingOrder(
        user_id=current_user.id,
        patient_name=order_in.patient_name,
        patient_age=order_in.patient_age,
        patient_gender=order_in.patient_gender,
        lab_id=order_in.lab_id,
        total_amount=order_in.total_amount,
        collection_type=order_in.collection_type,
        address=order_in.address,
        scheduled_date=order_in.scheduled_date,
        scheduled_time_slot=order_in.scheduled_time_slot,
        status=OrderStatus.BOOKED
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)

    # Add the tests
    for test_id in order_in.test_ids:
        order_test = OrderTest(
            order_id=order.id,
            test_id=test_id
        )
        db.add(order_test)
    
    await db.commit()
    await db.refresh(order)
    return order

@router.get("/", response_model=List[BookingOrderResponse])
async def get_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    stmt = select(BookingOrder).where(BookingOrder.user_id == current_user.id).order_by(BookingOrder.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{order_id}", response_model=BookingOrderResponse)
async def get_booking(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    stmt = select(BookingOrder).where(BookingOrder.id == order_id, BookingOrder.user_id == current_user.id)
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
