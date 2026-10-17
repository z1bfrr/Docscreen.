"""
LPG Monitor API Routes
Base prefix: /api/v1/lpg

Endpoints:
  POST  /register          - Register (or update) an ESP32 device
  POST  /reading           - ESP32 posts a weight reading (no auth required - uses device_id as key)
  GET   /status/{device_id}- Dashboard status for a specific device
  GET   /history/{device_id}- Reading history (for chart)
  GET   /alerts/{device_id} - Alert history
  POST  /push-token        - Register Expo push token for a device
  GET   /devices           - List all devices (auth required)
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from app.core.database import get_db
from app.schemas.lpg import (
    LpgDeviceRegisterRequest,
    LpgDeviceResponse,
    LpgReadingPost,
    LpgReadingResponse,
    LpgAlertResponse,
    LpgStatusResponse,
    PushTokenRegisterRequest,
)
from app.models.lpg_device import LpgDevice, LpgReading, LpgAlert
from app.services import lpg_service

router = APIRouter()

# In-memory push token store (device_id → expo_token)
# For production, persist this in the DB / Redis
_push_tokens: dict[str, str] = {}


# ── Device Registration ──────────────────────────────────────────────────────

@router.post("/register", response_model=LpgDeviceResponse, summary="Register or update an ESP32 device")
async def register_device(
    body: LpgDeviceRegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Called by the ESP32 on boot, or from the mobile app.
    Idempotent — calling it multiple times with the same device_id just updates settings.
    """
    device = await lpg_service.register_device(db, body.model_dump())
    return device


# ── Reading Ingestion (called by ESP32) ─────────────────────────────────────

@router.post("/reading", response_model=LpgReadingResponse, summary="Post a weight reading from ESP32")
async def post_reading(
    body: LpgReadingPost,
    db: AsyncSession = Depends(get_db),
):
    """
    Called by the ESP32 every N seconds.
    No authentication needed — device_id acts as the key.
    The server calculates gas %, checks thresholds, and may fire push notifications.
    """
    expo_token = _push_tokens.get(body.device_id)
    reading = await lpg_service.process_reading(
        db=db,
        device_id=body.device_id,
        raw_weight_kg=body.raw_weight_kg,
        expo_push_token=expo_token,
    )
    return reading


# ── Dashboard Status ─────────────────────────────────────────────────────────

@router.get("/status/{device_id}", response_model=LpgStatusResponse, summary="Get live status for dashboard")
async def get_status(
    device_id: str,
    db: AsyncSession = Depends(get_db),
):
    status = await lpg_service.get_device_status(db, device_id)
    if not status:
        raise HTTPException(status_code=404, detail=f"Device '{device_id}' not found")
    return status


# ── Reading History (for chart) ──────────────────────────────────────────────

@router.get("/history/{device_id}", response_model=list[LpgReadingResponse], summary="Reading history for chart")
async def get_history(
    device_id: str,
    limit: int = Query(50, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    readings = await lpg_service.get_readings_history(db, device_id, limit)
    return readings


# ── Alert History ────────────────────────────────────────────────────────────

@router.get("/alerts/{device_id}", response_model=list[LpgAlertResponse], summary="Alert history for a device")
async def get_alerts(
    device_id: str,
    limit: int = Query(20, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(LpgDevice).where(LpgDevice.device_id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail=f"Device '{device_id}' not found")

    a = await db.execute(
        select(LpgAlert)
        .where(LpgAlert.device_id_fk == device.id)
        .order_by(desc(LpgAlert.created_at))
        .limit(limit)
    )
    return a.scalars().all()


# ── Push Token Registration ──────────────────────────────────────────────────

@router.post("/push-token", summary="Register Expo push token for a device")
async def register_push_token(body: PushTokenRegisterRequest):
    """
    Mobile app sends the Expo push token after requesting notification permissions.
    Token is linked to the LPG device_id so alerts for that device are routed correctly.
    """
    _push_tokens[body.device_id] = body.expo_token
    return {"message": "Push token registered successfully", "device_id": body.device_id}


# ── List All Devices ─────────────────────────────────────────────────────────

@router.get("/devices", response_model=list[LpgDeviceResponse], summary="List all registered LPG devices")
async def list_devices(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LpgDevice).where(LpgDevice.is_active == True))
    return result.scalars().all()
