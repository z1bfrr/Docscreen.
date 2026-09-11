import type { CylinderStatus } from '../../types/sensor';

interface StatusPillProps {
  status: CylinderStatus | 'CONNECTED' | 'OFFLINE';
  label?: string;
}

export function StatusPill({ status, label }: StatusPillProps) {
  const config = {
    NORMAL:    { dot: 'bg-status-ok', text: 'text-status-ok', bg: 'bg-status-ok-dim border-status-ok/20', display: label ?? 'Normal' },
    LOW:       { dot: 'bg-status-error', text: 'text-status-error', bg: 'bg-status-error-dim border-status-error/20', display: label ?? 'Low' },
    CONNECTED: { dot: 'bg-status-ok', text: 'text-status-ok', bg: 'bg-status-ok-dim border-status-ok/20', display: label ?? 'Connected' },
    OFFLINE:   { dot: 'bg-status-error', text: 'text-status-error', bg: 'bg-status-error-dim border-status-error/20', display: label ?? 'Offline' },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-[11px] font-semibold border ${config.text} ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0 pulse-dot`} />
      <span className="uppercase tracking-widest">{config.display}</span>
    </span>
  );
}
