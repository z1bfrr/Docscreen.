interface StatPillProps {
  label: string;
  value: number | null;
  unit?: string;
  accent?: boolean;
}

export function StatPill({ label, value, unit = 'kg', accent = false }: StatPillProps) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-card bg-surface-raised border border-border min-w-[80px]">
      <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium">
        {label}
      </span>
      <span className={`font-mono text-sm font-semibold ${accent ? 'text-accent' : 'text-text-primary'}`}>
        {value !== null ? `${value} ${unit}` : '—'}
      </span>
    </div>
  );
}
