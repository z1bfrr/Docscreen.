import { useSensorHistory } from '../context/SensorContext';
import { WeightChart } from '../components/chart/WeightChart';
import { useSensorStats } from '../hooks/useSensorStats';
import { TrendingUp, TrendingDown, BarChart2, Activity } from 'lucide-react';

const STAT_CONFIGS = [
  { key: 'current', label: 'Current', Icon: Activity,   color: 'text-accent',       bg: 'bg-accent-glow border-accent-ring' },
  { key: 'min',     label: 'Minimum', Icon: TrendingDown, color: 'text-status-error', bg: 'bg-status-error-dim border-status-error/20' },
  { key: 'max',     label: 'Maximum', Icon: TrendingUp,  color: 'text-status-ok',    bg: 'bg-status-ok-dim border-status-ok/20' },
  { key: 'avg',     label: 'Average', Icon: BarChart2,   color: 'text-indigo',       bg: 'bg-indigo-dim border-indigo/20' },
] as const;

export function History() {
  const { history } = useSensorHistory();
  const stats = useSensorStats(history);

  return (
    <div className="px-4 py-6 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-text-primary tracking-tight">Weight History</h1>
          <p className="text-xs text-text-muted mt-1">
            Last <span className="text-text-secondary font-semibold">{history.length}</span> readings · updates live
          </p>
        </div>
      </div>

      {/* Full-width chart */}
      <div className="glass-card rounded-card p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Trend Chart</h2>
          <span className="inline-flex items-center gap-1.5 text-[10px] text-status-ok font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-status-ok pulse-dot" />
            Live
          </span>
        </div>
        {history.length > 0 ? (
          <WeightChart
            history={history}
            showBrush={history.length > 20}
            showAvg
            minHeight={400}
          />
        ) : (
          <div className="h-[400px] flex items-center justify-center text-text-muted text-sm">
            Waiting for data…
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAT_CONFIGS.map(({ key, label, Icon, color, bg }) => {
          const val = stats[key as keyof typeof stats];
          return (
            <div
              key={key}
              className={`glass-card glass-card-hover rounded-card p-4 flex flex-col gap-3 border ${bg}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-semibold">
                  {label}
                </span>
                <div className={`w-6 h-6 rounded-[6px] flex items-center justify-center ${bg}`}>
                  <Icon size={12} className={color} />
                </div>
              </div>
              <span className={`text-xl font-mono font-bold ${color}`}>
                {val !== null ? `${val} kg` : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
