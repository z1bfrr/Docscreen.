import { useEffect, useRef, useState } from 'react';
import { useLiveSensor } from '../../context/SensorContext';
import { useSettings } from '../../context/SettingsContext';
import type { CylinderStatus } from '../../types/sensor';

// SVG radial progress ring
function RadialRing({ pct, status }: { pct: number; status: CylinderStatus }) {
  const radius = 54;
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const offset = circumference - (Math.min(pct, 100) / 100) * circumference;

  const color =
    status === 'LOW'
      ? '#EF4444'
      : pct > 40
      ? '#10B981'
      : '#F59E0B';

  const glowId = `ring-glow-${status}`;

  return (
    <svg
      width={radius * 2}
      height={radius * 2}
      className="absolute inset-0"
      aria-hidden="true"
    >
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Track */}
      <circle
        cx={radius}
        cy={radius}
        r={normalizedRadius}
        fill="none"
        stroke="#1E293B"
        strokeWidth={stroke}
      />
      {/* Progress */}
      <circle
        cx={radius}
        cy={radius}
        r={normalizedRadius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${radius} ${radius})`}
        filter={`url(#${glowId})`}
        style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.4,0,0.2,1), stroke 400ms ease' }}
      />
    </svg>
  );
}

export function WeightHero() {
  const { currentReading } = useLiveSensor();
  const { settings } = useSettings();
  const [flash, setFlash] = useState(false);
  const prevWeightRef = useRef<number | null>(null);

  const weight = currentReading?.weight ?? 14.8;
  const pct = (weight / settings.fullWeight) * 100;
  const percentage = pct.toFixed(1);
  const status: CylinderStatus = weight <= settings.lowThreshold ? 'LOW' : 'NORMAL';

  const ringSize = 108; // diameter px

  useEffect(() => {
    if (currentReading && currentReading.weight !== prevWeightRef.current) {
      prevWeightRef.current = currentReading.weight;
      setFlash(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setFlash(true)));
    }
  }, [currentReading]);

  const handleAnimationEnd = () => setFlash(false);

  const statusColor =
    status === 'LOW' ? 'text-status-error' : pct > 40 ? 'text-status-ok' : 'text-status-warn';
  const statusBg =
    status === 'LOW' ? 'bg-status-error-dim border-status-error/20' : pct > 40 ? 'bg-status-ok-dim border-status-ok/20' : 'bg-status-warn-dim border-status-warn/20';
  const statusLabel = status === 'LOW' ? 'Low — Refill Soon' : pct > 40 ? 'Normal' : 'Getting Low';

  return (
    <div className="glass-card rounded-card-lg p-6 shadow-card relative overflow-hidden">
      {/* Subtle background glow */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background:
            status === 'LOW'
              ? 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Card header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <span className="text-[11px] uppercase tracking-widest text-text-muted font-semibold">
          Current Weight
        </span>
      </div>

      {/* Weight display with radial ring */}
      <div className="flex flex-col items-center py-4 relative z-10">
        {/* Ring + number combined */}
        <div className="relative flex items-center justify-center" style={{ width: ringSize, height: ringSize }}>
          <RadialRing pct={pct} status={status} />
          <div className="relative z-10 text-center">
            <div className="text-[11px] text-text-muted font-semibold uppercase tracking-wider">
              {percentage}%
            </div>
          </div>
        </div>

        {/* Big weight number below ring */}
        <div
          className={`font-hero text-text-primary tabular-nums mt-4 ${flash ? 'weight-flash' : ''}`}
          onAnimationEnd={handleAnimationEnd}
          aria-live="polite"
          aria-label={`Current weight: ${weight} kilograms`}
        >
          {weight.toFixed(1)}
          <span className="text-3xl text-text-muted font-mono ml-2">kg</span>
        </div>

        {/* Status badge */}
        <div className="mt-4">
          <span
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill text-xs font-semibold border ${statusColor} ${statusBg}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                status === 'LOW' ? 'bg-status-error' : pct > 40 ? 'bg-status-ok' : 'bg-status-warn'
              } pulse-dot`}
            />
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
