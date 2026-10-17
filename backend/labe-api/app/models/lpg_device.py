"""
LPG Monitor - SQLAlchemy Models
Tables:
  - lpg_devices   : registered ESP32 devices (one per cylinder)
  - lpg_readings  : weight / gas-level readings posted by the device
  - lpg_alerts    : alert history (warning / critical events)
"""

import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean,
    DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class AlertLevel(str, enum.Enum):
    WARNING  = "WARNING"   # gas ≤ 30 %
    CRITICAL = "CRITICAL"  # gas ≤ 10 %
    RESOLVED = "RESOLVED"  # gas refilled / back to normal


class LpgDevice(Base):
    """One row per physical ESP32 device / cylinder."""
    __tablename__ = "lpg_devices"

    id               = Column(Integer, primary_key=True, index=True)
    device_id        = Column(String, unique=True, index=True, nullable=False)  # MAC-based unique ID from ESP32
    name             = Column(String, nullable=False, default="My Cylinder")
    owner_user_id    = Column(Integer, ForeignKey("users.id"), nullable=True)
    tare_weight_kg   = Column(Float, default=15.5)   # empty cylinder weight  (14.2 kg LPG → ~15.5 kg tare)
    full_weight_kg   = Column(Float, default=29.7)   # full cylinder weight   (15.5 + 14.2)
    warning_pct      = Column(Float, default=30.0)   # alert threshold: warning
    critical_pct     = Column(Float, default=10.0)   # alert threshold: critical
    is_active        = Column(Boolean, default=True)
    last_seen_at     = Column(DateTime, nullable=True)
    created_at       = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner    = relationship("User", foreign_keys=[owner_user_id])
    readings = relationship("LpgReading", back_populates="device", cascade="all, delete-orphan")
    alerts   = relationship("LpgAlert",   back_populates="device", cascade="all, delete-orphan")


class LpgReading(Base):
    """Weight + calculated gas % readings posted by the ESP32 periodically."""
    __tablename__ = "lpg_readings"

    id              = Column(Integer, primary_key=True, index=True)
    device_id_fk    = Column(Integer, ForeignKey("lpg_devices.id"), nullable=False)
    raw_weight_kg   = Column(Float, nullable=False)   # actual measured weight from load cell
    gas_remaining_kg  = Column(Float, nullable=False) # raw_weight_kg - tare_weight_kg
    gas_remaining_pct = Column(Float, nullable=False) # (gas_remaining_kg / 14.2) * 100, clamped 0-100
    timestamp       = Column(DateTime, default=datetime.utcnow, index=True)

    device = relationship("LpgDevice", back_populates="readings")


class LpgAlert(Base):
    """Alert events raised when gas % crosses a threshold."""
    __tablename__ = "lpg_alerts"

    id           = Column(Integer, primary_key=True, index=True)
    device_id_fk = Column(Integer, ForeignKey("lpg_devices.id"), nullable=False)
    level        = Column(Enum(AlertLevel), nullable=False)
    gas_pct      = Column(Float, nullable=False)
    message      = Column(String, nullable=False)
    is_sent      = Column(Boolean, default=False)  # whether push notification was sent
    created_at   = Column(DateTime, default=datetime.utcnow, index=True)

    device = relationship("LpgDevice", back_populates="alerts")
