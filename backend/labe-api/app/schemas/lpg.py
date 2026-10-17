"""
Pydantic schemas for the LPG Monitor feature.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.lpg_device import AlertLevel


# ─────────────────────────────────────────────
# Device schemas
# ─────────────────────────────────────────────

class LpgDeviceRegisterRequest(BaseModel):
    """Sent by the ESP32 (or user) on first boot to register a device."""
    device_id:      str   = Field(..., description="Unique device identifier (e.g. ESP32 MAC address)")
    name:           str   = Field("My Cylinder", description="Friendly name for this cylinder")
    tare_weight_kg: float = Field(15.5, description="Empty cylinder weight in kg")
    full_weight_kg: float = Field(29.7, description="Full cylinder weight in kg (tare + gas capacity)")
    warning_pct:    float = Field(30.0, ge=0, le=100)
    critical_pct:   float = Field(10.0, ge=0, le=100)


class LpgDeviceResponse(BaseModel):
    id:               int
    device_id:        str
    name:             str
    tare_weight_kg:   float
    full_weight_kg:   float
    warning_pct:      float
    critical_pct:     float
    is_active:        bool
    last_seen_at:     Optional[datetime]
    created_at:       datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# Reading schemas
# ─────────────────────────────────────────────

class LpgReadingPost(BaseModel):
    """
    Posted by the ESP32 every N seconds.
    Only raw_weight_kg is required — server calculates percentages.
    """
    device_id:      str   = Field(..., description="Device identifier (MAC-based)")
    raw_weight_kg:  float = Field(..., description="Weight reading from load cell in kg")


class LpgReadingResponse(BaseModel):
    id:                 int
    raw_weight_kg:      float
    gas_remaining_kg:   float
    gas_remaining_pct:  float
    timestamp:          datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# Alert schemas
# ─────────────────────────────────────────────

class LpgAlertResponse(BaseModel):
    id:         int
    level:      AlertLevel
    gas_pct:    float
    message:    str
    is_sent:    bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# Dashboard / status schema
# ─────────────────────────────────────────────

class LpgStatusResponse(BaseModel):
    """All-in-one status for the mobile dashboard."""
    device:          LpgDeviceResponse
    latest_reading:  Optional[LpgReadingResponse]
    recent_alerts:   list[LpgAlertResponse]
    gas_remaining_pct: float   # convenience top-level field
    status_label:    str       # "FULL" | "OK" | "LOW" | "CRITICAL" | "EMPTY" | "UNKNOWN"


# ─────────────────────────────────────────────
# Push token registration (Expo push)
# ─────────────────────────────────────────────

class PushTokenRegisterRequest(BaseModel):
    device_id:   str = Field(..., description="LPG device_id this token is associated with")
    expo_token:  str = Field(..., description="Expo push token from the mobile app")
