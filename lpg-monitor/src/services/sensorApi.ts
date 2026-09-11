import type { SensorReading, DeviceStatus } from '../types/sensor';

export interface SensorService {
  start: () => void;
  stop: () => void;
  subscribe: (cb: (reading: SensorReading) => void) => () => void;
  getHistory: () => SensorReading[];
  getDeviceStatus: () => DeviceStatus;
}
