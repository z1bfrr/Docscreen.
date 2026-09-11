interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  id?: string;
  label?: string;
}

export function Toggle({ checked, onChange, id, label }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className="inline-flex items-center gap-2.5 cursor-pointer select-none"
    >
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`w-10 h-[22px] rounded-pill border transition-all duration-200 ${
            checked
              ? 'border-accent'
              : 'bg-surface-raised border-border'
          }`}
          style={checked ? { background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' } : {}}
        />
        <div
          className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
            checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
          }`}
        />
      </div>
      {label && (
        <span className="text-sm text-text-secondary font-medium">{label}</span>
      )}
    </label>
  );
}
