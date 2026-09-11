import { memo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Brush, ReferenceLine,
} from 'recharts';

import type { SensorReading } from '../../types/sensor';
import { useSettings } from '../../context/SettingsContext';
import { StatPill } from '../ui/StatPill';
import { useSensorStats } from '../../hooks/useSensorStats';

interface WeightChartProps {
  history: SensorReading[];
  showBrush?: boolean;
  showAvg?: boolean;
  minHeight?: number;
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: SensorReading }>;
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const reading = payload[0].payload;
  return (
    <div className="bg-surface border border-border rounded-card px-3 py-2 shadow-lg">
      <p className="text-xs text-text-muted font-mono mb-1">
        {new Date(reading.timestamp).toLocaleTimeString()}
      </p>
      <p className="text-sm font-semibold text-accent font-mono">
        {reading.weight.toFixed(2)} kg
      </p>
      <p className="text-[11px] text-text-muted mt-0.5">{reading.device}</p>
    </div>
  );
}

export const WeightChart = memo(function WeightChart({
  history,
  showBrush = false,
  showAvg = false,
  minHeight = 220,
}: WeightChartProps) {
  const { settings } = useSettings();
  const stats = useSensorStats(history);

  // Thin out X-axis to max 6 ticks
  const tickIndices = (() => {
    if (history.length <= 6) return history.map((_, i) => i);
    const step = Math.floor(history.length / 5);
    const ticks: number[] = [];
    for (let i = 0; i < history.length; i += step) ticks.push(i);
    // Always include last
    if (ticks[ticks.length - 1] !== history.length - 1) {
      ticks.push(history.length - 1);
    }
    return ticks;
  })();

  const tickTimestamps = new Set(tickIndices.map((i) => history[i]?.timestamp));

  return (
    <div>
      <div style={{ minHeight }} className="w-full">
        <ResponsiveContainer width="100%" height={minHeight}>
          <LineChart
            data={history}
            margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#30363D"
              vertical={false}
            />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(v) => (tickTimestamps.has(v) ? formatTime(v) : '')}
              tick={{ fill: '#8B949E', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: '#30363D' }}
              tickLine={false}
              interval={0}
            />
            <YAxis
              domain={[0, settings.fullWeight]}
              tickFormatter={(v) => `${v}`}
              tick={{ fill: '#8B949E', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              label={{
                value: 'kg',
                position: 'insideTopLeft',
                offset: 4,
                style: { fill: '#8B949E', fontSize: 11 },
              }}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Low threshold reference line */}
            <ReferenceLine
              y={settings.lowThreshold}
              stroke="#F59E0B"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: `LOW ${settings.lowThreshold}kg`,
                position: 'insideBottomRight',
                style: { fill: '#F59E0B', fontSize: 10, fontFamily: 'JetBrains Mono' },
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#F59E0B', stroke: '#080C14', strokeWidth: 2 }}
              isAnimationActive={false}
            />
            {showBrush && history.length > 20 && (
              <Brush
                dataKey="timestamp"
                height={24}
                stroke="#30363D"
                fill="#161B22"
                travellerWidth={8}
                tickFormatter={(v) => formatTime(v)}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-2 mt-4">
        <StatPill label="Current" value={stats.current} accent />
        <StatPill label="Min" value={stats.min} />
        <StatPill label="Max" value={stats.max} />
        {showAvg && <StatPill label="Avg" value={stats.avg} />}
      </div>
    </div>
  );
});
