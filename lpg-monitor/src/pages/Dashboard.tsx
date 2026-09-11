import { useLiveSensor, useSensorHistory } from '../context/SensorContext';
import { useSettings } from '../context/SettingsContext';

import { StatusPill } from '../components/ui/StatusPill';
import { WeightHero } from '../components/dashboard/WeightHero';
import { StatusRow } from '../components/dashboard/StatusRow';
import { SensorInfoStrip } from '../components/dashboard/SensorInfoStrip';
import { WeightChart } from '../components/chart/WeightChart';
import { Flame } from 'lucide-react';

export function Dashboard() {
  const { deviceStatus } = useLiveSensor();
  const { history } = useSensorHistory();
  const { settings } = useSettings();

  return (
    <div className="px-4 py-6 md:px-8 max-w-[720px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-card flex items-center justify-center shrink-0 md:hidden"
            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}
          >
            <Flame size={18} className="text-bg" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary leading-tight tracking-tight">
              Smart LPG Monitor
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs font-mono text-text-muted">{settings.deviceName}</span>
              <StatusPill status={deviceStatus.connected ? 'CONNECTED' : 'OFFLINE'} />
            </div>
          </div>
        </div>

      </div>

      {/* Current Weight Card — dominant */}
      <div className="mb-4">
        <WeightHero />
      </div>

      {/* Status Row */}
      <div className="mb-4">
        <StatusRow />
      </div>

      {/* Weight History Chart */}
      <div className="glass-card rounded-card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Weight History
          </h2>
          {history.length > 0 && (
            <span className="text-[10px] text-text-muted font-mono">
              {history.length} readings
            </span>
          )}
        </div>
        {history.length > 0 ? (
          <WeightChart history={history} />
        ) : (
          <div className="h-[220px] flex flex-col items-center justify-center text-text-muted text-sm gap-2">
            <div className="w-8 h-8 rounded-full bg-surface-raised flex items-center justify-center">
              <Flame size={16} className="text-text-faint" />
            </div>
            <span>Waiting for data…</span>
          </div>
        )}
      </div>

      {/* Sensor Info Strip */}
      <SensorInfoStrip />
    </div>
  );
}
