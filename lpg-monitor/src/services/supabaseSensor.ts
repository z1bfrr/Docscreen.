import { supabase } from '../lib/supabase';
import type { SensorReading, DeviceStatus, AppSettings } from '../types/sensor';
import type { SensorService } from './sensorApi';

const HISTORY_MAX = 50;

export interface SupabaseSensorService extends SensorService {
  restartWithNewInterval: () => void;
}

/**
 * Creates a sensor service backed by Supabase Realtime.
 *
 * Data flow:
 *   ESP32  →  POST /rest/v1/sensor_readings  →  Supabase DB
 *   Supabase Realtime  →  onInsert callback  →  React state
 *
 * On mount: loads the last N readings from the DB.
 * Live: subscribes to INSERT events on sensor_readings table.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createSupabaseSensor(
  _getSettings: () => AppSettings
): SupabaseSensorService {
  let history: SensorReading[] = [];
  const subscribers = new Set<(reading: SensorReading) => void>();
  let channel: ReturnType<typeof supabase.channel> | null = null;

  // Default device status — updated as readings arrive
  let deviceStatus: DeviceStatus = {
    connected: false,
    lastSeen: new Date().toISOString(),
    ssid: 'Supabase Cloud',
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function pushReading(row: { weight: number; timestamp: string; device: string }) {
    const reading: SensorReading = {
      weight: parseFloat(String(row.weight)),
      timestamp: row.timestamp,
      device: row.device,
    };

    history.push(reading);
    if (history.length > HISTORY_MAX) {
      history.splice(0, history.length - HISTORY_MAX);
    }

    deviceStatus = {
      connected: true,
      lastSeen: reading.timestamp,
      ssid: 'Supabase Cloud',
    };

    subscribers.forEach((cb) => cb(reading));
  }

  // ─── Load initial history from DB ─────────────────────────────────────────

  async function loadHistory() {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('weight, timestamp, device')
      .order('timestamp', { ascending: true })
      .limit(HISTORY_MAX);

    if (error) {
      console.error('[SupabaseSensor] Failed to load history:', error.message);
      return;
    }

    if (data && data.length > 0) {
      history = data.map((row) => ({
        weight: parseFloat(String(row.weight)),
        timestamp: row.timestamp,
        device: row.device,
      }));

      // Notify with the latest reading so current weight is shown immediately
      const latest = history[history.length - 1];
      deviceStatus = { connected: true, lastSeen: latest.timestamp, ssid: 'Supabase Cloud' };
      subscribers.forEach((cb) => cb(latest));
    }
  }

  // ─── Realtime subscription ─────────────────────────────────────────────────

  function subscribeRealtime() {
    channel = supabase
      .channel('sensor_readings_live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
        (payload) => {
          const row = payload.new as { weight: number; timestamp: string; device: string };
          pushReading(row);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[SupabaseSensor] Realtime connected ✓');
          deviceStatus = { ...deviceStatus, connected: true };
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn('[SupabaseSensor] Realtime disconnected:', status);
          deviceStatus = { ...deviceStatus, connected: false };
        }
      });
  }

  // ─── SensorService interface ───────────────────────────────────────────────

  function start() {
    loadHistory().then(() => subscribeRealtime());
  }

  function stop() {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
  }

  // No-op for Supabase — interval is controlled by ESP32, not the frontend
  function restartWithNewInterval() {}

  function subscribe(cb: (reading: SensorReading) => void): () => void {
    subscribers.add(cb);
    // If we already have readings, immediately give the latest one
    if (history.length > 0) {
      cb(history[history.length - 1]);
    }
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
