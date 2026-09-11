export interface SensorReading {
  weight: number;       // kg, e.g. 14.8
  timestamp: string;    // ISO 8601, e.g. "2026-09-11T10:30:00Z"
  device: string;       // e.g. "ESP32-01"
}

export interface DeviceStatus {
  connected: boolean;
  lastSeen: string;     // ISO 8601
  ssid: string;
}

export interface AppSettings {
  deviceName: string;       // default: "ESP32-01"
  fullWeight: number;       // kg — reference for 100%, default: 25
  lowThreshold: number;     // kg — triggers LOW status, default: 5
  updateInterval: number;   // seconds between ticks, default: 3, range: 1–60
  liveDemo: boolean;        // default: true
}

export type CylinderStatus = "NORMAL" | "LOW";
