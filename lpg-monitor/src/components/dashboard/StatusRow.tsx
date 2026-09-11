import { useLiveSensor } from '../../context/SensorContext';
import { useSettings } from '../../context/SettingsContext';
import { useRelativeTime } from '../../hooks/useRelativeTime';
import { Wifi, WifiOff, Clock } from 'lucide-react';

export function StatusRow() {
  const { deviceStatus, currentReading } = useLiveSensor();
  const { settings } = useSettings();
  const relativeTime = useRelativeTime(currentReading?.timestamp);
  const isConnected = deviceStatus.connected;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Device card */}
      <div className="glass-card glass-card-hover rounded-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0 ${
              isConnected ? 'bg-status-ok-dim' : 'bg-status-error-dim'
            }`}
          >
            {isConnected
              ? <Wifi size={14} className="text-status-ok" />
              : <WifiOff size={14} className="text-status-error" />
            }
          </div>
          <span className="text-[10px] uppercase tracking-widest text-text-muted font-semibold">
            Device
          </span>
        </div>

        <div className="flex flex-col gap-1.5 mt-auto">
          <span className="text-sm font-semibold text-text-primary font-mono leading-tight truncate">
            {settings.deviceName}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isConnected ? 'bg-status-ok pulse-dot' : 'bg-status-error'
              }`}
            />
            <span
              className={`text-xs font-medium ${
                isConnected ? 'text-status-ok' : 'text-status-error'
              }`}
            >
              {isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="text-[10px] text-text-muted font-mono pt-1 border-t border-border truncate">
          {deviceStatus.ssid || '—'}
        </div>
      </div>

      {/* Last updated card */}
      <div className="glass-card glass-card-hover rounded-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0 bg-indigo-dim">
            <Clock size={14} className="text-indigo" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-text-muted font-semibold">
            Last Updated
          </span>
        </div>

        <div className="flex flex-col gap-1.5 mt-auto">
          <span className="text-sm font-semibold text-text-primary leading-tight" aria-live="polite">
            {relativeTime}
          </span>
        </div>

        <div className="text-[10px] text-text-muted font-mono pt-1 border-t border-border">
          {currentReading?.timestamp
            ? new Date(currentReading.timestamp).toLocaleTimeString()
            : '—'}
        </div>
      </div>
    </div>
  );
}
