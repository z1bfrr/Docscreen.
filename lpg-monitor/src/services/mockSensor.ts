import type { SensorReading, DeviceStatus, AppSettings } from '../types/sensor';
import type { SensorService } from './sensorApi';

const HISTORY_MAX = 50;

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export interface MockSensorService extends SensorService {
  restartWithNewInterval: () => void;
}

export function createMockSensor(getSettings: () => AppSettings): MockSensorService {
  let weight = 14.8;
  const history: SensorReading[] = [];
  const subscribers = new Set<(reading: SensorReading) => void>();
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let deviceStatus: DeviceStatus = {
    connected: true,
    lastSeen: new Date().toISOString(),
    ssid: 'HomeWiFi',
  };

  function tick() {
    const settings = getSettings();
    if (!settings.liveDemo) return;

    const delta = randomBetween(-0.05, 0.01);
    weight = Math.max(0, Math.min(settings.fullWeight, weight + delta));

    const reading: SensorReading = {
      weight: parseFloat(weight.toFixed(2)),
      timestamp: new Date().toISOString(),
      device: settings.deviceName,
    };

    deviceStatus = {
      ...deviceStatus,
      lastSeen: reading.timestamp,
    };

    history.push(reading);
    if (history.length > HISTORY_MAX) {
      history.splice(0, history.length - HISTORY_MAX);
    }

    subscribers.forEach((cb) => cb(reading));
  }

  function start() {
    if (intervalId !== null) return;
    tick();
    const settings = getSettings();
    intervalId = setInterval(tick, settings.updateInterval * 1000);
  }

  function stop() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function restartWithNewInterval() {
    if (intervalId !== null) {
      stop();
      const settings = getSettings();
      tick();
      intervalId = setInterval(tick, settings.updateInterval * 1000);
    }
  }

  function subscribe(cb: (reading: SensorReading) => void): () => void {
    subscribers.add(cb);
    return () => subscribers.delete(cb);
  }

  function getHistory(): SensorReading[] {
    return [...history];
  }

  function getDeviceStatus(): DeviceStatus {
    return { ...deviceStatus };
  }

  return {
    start,
    stop,
    subscribe,
    getHistory,
    getDeviceStatus,
    restartWithNewInterval,
  };
}
