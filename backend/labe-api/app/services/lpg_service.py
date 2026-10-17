"""
LPG Monitor Service
Handles:
  - weight → gas % calculation
  - alert threshold detection
  - Expo push notification dispatch
"""

import httpx
import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from app.models.lpg_device import LpgDevice, LpgReading, LpgAlert, AlertLevel

logger = logging.getLogger(__name__)

# ── Constants ────────────────────────────────
GAS_CAPACITY_KG = 14.2      # Standard domestic LPG cylinder
EXPO_PUSH_URL   = "https://exp.host/--/api/v2/push/send"


# ── Helpers ──────────────────────────────────

def _calc_gas_pct(raw_weight_kg: float, tare_kg: float, full_kg: float) -> tuple[float, float]:
    """Returns (gas_remaining_kg, gas_remaining_pct) clamped to [0, 100]."""
    gas_kg  = max(raw_weight_kg - tare_kg, 0.0)
    capacity = full_kg - tare_kg
    if capacity <= 0:
        capacity = GAS_CAPACITY_KG
    pct = min((gas_kg / capacity) * 100.0, 100.0)
    return round(gas_kg, 3), round(pct, 2)


def _status_label(pct: float) -> str:
    if pct >= 90:  return "FULL"
    if pct >= 30:  return "OK"
    if pct >= 10:  return "LOW"
    if pct >   0:  return "CRITICAL"
    return "EMPTY"


async def _send_expo_push(token: str, title: str, body: str):
    """Fire-and-forget Expo push notification."""
    payload = {
        "to": token,
        "sound": "default",
        "title": title,
        "body": body,
        "data": {"type": "lpg_alert"},
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(EXPO_PUSH_URL, json=payload)
            resp.raise_for_status()
            logger.info(f"Push sent → {token} | status {resp.status_code}")
    except Exception as e:
        logger.warning(f"Push failed for token {token}: {e}")


# ── Core Service Functions ────────────────────

async def get_or_create_device(db: AsyncSession, device_id: str, **kwargs) -> LpgDevice:
    """Fetch device by device_id, creating it if not found."""
    result = await db.execute(select(LpgDevice).where(LpgDevice.device_id == device_id))
    device = result.scalar_one_or_none()
    if device is None:
        device = LpgDevice(device_id=device_id, **kwargs)
        db.add(device)
        await db.commit()
        await db.refresh(device)
    return device


async def register_device(db: AsyncSession, data: dict) -> LpgDevice:
    """Register (or update) a device from the registration payload."""
    result = await db.execute(select(LpgDevice).where(LpgDevice.device_id == data["device_id"]))
    device = result.scalar_one_or_none()
    if device is None:
        device = LpgDevice(**data)
        db.add(device)
    else:
        for k, v in data.items():
            setattr(device, k, v)
    await db.commit()
    await db.refresh(device)
    return device


async def process_reading(
    db: AsyncSession,
    device_id: str,
    raw_weight_kg: float,
    expo_push_token: str | None = None,
) -> LpgReading:
    """
    1. Resolve device
    2. Compute gas %
    3. Persist reading
    4. Check thresholds → create alert + send push if needed
    """
    # 1. Get device
    result = await db.execute(select(LpgDevice).where(LpgDevice.device_id == device_id))
    device: LpgDevice | None = result.scalar_one_or_none()
    if device is None:
        # Auto-register with defaults if device not yet registered
        device = LpgDevice(device_id=device_id)
        db.add(device)
        await db.flush()

    # 2. Calculate
    gas_kg, gas_pct = _calc_gas_pct(raw_weight_kg, device.tare_weight_kg, device.full_weight_kg)

    # 3. Persist reading
    reading = LpgReading(
        device_id_fk=device.id,
        raw_weight_kg=raw_weight_kg,
        gas_remaining_kg=gas_kg,
        gas_remaining_pct=gas_pct,
        timestamp=datetime.utcnow(),
    )
    db.add(reading)

    # Update device last_seen
    device.last_seen_at = datetime.utcnow()

    # 4. Threshold checking
    alert_level = None
    alert_msg   = None

    if gas_pct <= device.critical_pct:
        alert_level = AlertLevel.CRITICAL
        alert_msg   = f"🔴 CRITICAL: Only {gas_pct:.1f}% LPG remaining ({gas_kg:.2f} kg)! Refill immediately."
    elif gas_pct <= device.warning_pct:
        alert_level = AlertLevel.WARNING
        alert_msg   = f"⚠️ LOW GAS: {gas_pct:.1f}% LPG remaining ({gas_kg:.2f} kg). Plan a refill soon."

    if alert_level:
        # Avoid duplicate alerts within the last 60 readings
        recent = await db.execute(
            select(LpgAlert)
            .where(LpgAlert.device_id_fk == device.id, LpgAlert.level == alert_level)
            .order_by(desc(LpgAlert.created_at))
            .limit(1)
        )
        last_alert = recent.scalar_one_or_none()

        # Only raise a new alert if last one was at a different pct threshold or resolved
        should_alert = (last_alert is None or last_alert.level != alert_level)

        if should_alert:
            alert = LpgAlert(
                device_id_fk=device.id,
                level=alert_level,
                gas_pct=gas_pct,
                message=alert_msg,
            )
            db.add(alert)

            # Send push notification if token available
            if expo_push_token:
                title = "🔴 LPG Critical!" if alert_level == AlertLevel.CRITICAL else "⚠️ LPG Low"
                await _send_expo_push(expo_push_token, title, alert_msg)
                alert.is_sent = True

    await db.commit()
    await db.refresh(reading)
    return reading


async def get_device_status(db: AsyncSession, device_id: str) -> dict | None:
    """Full status dict for the dashboard."""
    result = await db.execute(select(LpgDevice).where(LpgDevice.device_id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        return None

    # Latest reading
    r = await db.execute(
        select(LpgReading)
        .where(LpgReading.device_id_fk == device.id)
        .order_by(desc(LpgReading.timestamp))
        .limit(1)
    )
    latest = r.scalar_one_or_none()

    # Recent alerts (last 10)
    a = await db.execute(
        select(LpgAlert)
        .where(LpgAlert.device_id_fk == device.id)
        .order_by(desc(LpgAlert.created_at))
        .limit(10)
    )
    alerts = a.scalars().all()

    gas_pct = latest.gas_remaining_pct if latest else 0.0

    return {
        "device": device,
        "latest_reading": latest,
        "recent_alerts": alerts,
        "gas_remaining_pct": gas_pct,
        "status_label": _status_label(gas_pct) if latest else "UNKNOWN",
    }


async def get_readings_history(db: AsyncSession, device_id: str, limit: int = 50) -> list[LpgReading]:
    """Returns the last N readings for a device (for chart)."""
    result = await db.execute(select(LpgDevice).where(LpgDevice.device_id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        return []

    r = await db.execute(
        select(LpgReading)
        .where(LpgReading.device_id_fk == device.id)
        .order_by(desc(LpgReading.timestamp))
        .limit(limit)
    )
    return list(reversed(r.scalars().all()))
