import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  memo,
} from 'react';
import type { SensorReading, DeviceStatus } from '../types/sensor';
import { createMockSensor } from '../services/mockSensor';
import { createSupabaseSensor } from '../services/supabaseSensor';
import { useSettings } from './SettingsContext';

// ─── Split into two contexts to avoid re-rendering chart on every tick ────────

interface LiveContextValue {
  currentReading: SensorReading | null;
  deviceStatus: DeviceStatus;
  isSupabase: boolean;
}

interface HistoryContextValue {
  history: SensorReading[];
}

const LiveContext    = createContext<LiveContextValue | null>(null);
const HistoryContext = createContext<HistoryContextValue | null>(null);

// Keep backward-compat combined type for existing useSensor() callers
interface SensorContextValue extends LiveContextValue, HistoryContextValue {}

const DEFAULT_DEVICE_STATUS: DeviceStatus = {
  connected: false,
  lastSeen: new Date().toISOString(),
  ssid: 'Connecting…',
};

const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

export const SensorProvider = memo(function SensorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = useSettings();
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const [currentReading, setCurrentReading] = useState<SensorReading | null>(null);
  const [history,        setHistory]         = useState<SensorReading[]>([]);
  const [deviceStatus,   setDeviceStatus]    = useState<DeviceStatus>(DEFAULT_DEVICE_STATUS);

  const sensorRef = useRef(
    USE_SUPABASE
      ? createSupabaseSensor(() => settingsRef.current)
      : createMockSensor(() => settingsRef.current)
  );

  useEffect(() => {
    const sensor = sensorRef.current;
    const unsub = sensor.subscribe((reading) => {
      setCurrentReading(reading);
      // Use functional update to avoid stale closure capturing old history
      setHistory(sensor.getHistory());
      setDeviceStatus(sensor.getDeviceStatus());
    });
    sensor.start();
    return () => {
      unsub();
      sensor.stop();
    };
  }, []);

  const prevIntervalRef = useRef(settings.updateInterval);
  useEffect(() => {
    const sensor = sensorRef.current;
    const changed = prevIntervalRef.current !== settings.updateInterval;
    prevIntervalRef.current = settings.updateInterval;
    if (changed) sensor.restartWithNewInterval();
  }, [settings.updateInterval]);

  // Memoize context values to prevent unnecessary re-renders
  const liveValue    = useRef<LiveContextValue>({ currentReading, deviceStatus, isSupabase: USE_SUPABASE });
  const historyValue = useRef<HistoryContextValue>({ history });
  liveValue.current    = { currentReading, deviceStatus, isSupabase: USE_SUPABASE };
  historyValue.current = { history };

  return (
    <LiveContext.Provider value={liveValue.current}>
      <HistoryContext.Provider value={historyValue.current}>
        {children}
      </HistoryContext.Provider>
    </LiveContext.Provider>
  );
});

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Full sensor data — use only where you need both live + history */
export function useSensor(): SensorContextValue {
  const live    = useContext(LiveContext);
  const history = useContext(HistoryContext);
  if (!live || !history) throw new Error('useSensor must be used within SensorProvider');
  return { ...live, ...history };
}

/** Only live reading + device status — doesn't re-render when history grows */
export function useLiveSensor(): LiveContextValue {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error('useLiveSensor must be used within SensorProvider');
  return ctx;
}

/** Only history — doesn't re-render on every new tick, only when array grows */
export function useSensorHistory(): HistoryContextValue {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useSensorHistory must be used within SensorProvider');
  return ctx;
}
