import { Cpu, Radio, Zap, Wifi } from 'lucide-react';

const SENSOR_INFO = [
  { label: 'Load Cell', value: '50 kg', Icon: Zap },
  { label: 'Amplifier', value: 'HX711', Icon: Cpu },
  { label: 'Controller', value: 'ESP32', Icon: Radio },
  { label: 'Protocol', value: 'Wi-Fi', Icon: Wifi },
];

export function SensorInfoStrip() {
  return (
    <div className="glass-card rounded-card px-5 py-3">
      <div className="flex flex-wrap gap-y-2">
        {SENSOR_INFO.map(({ label, value, Icon }, i) => (
          <div
            key={label}
            className={`flex items-center gap-2 flex-1 min-w-[80px] ${
              i < SENSOR_INFO.length - 1 ? 'border-r border-border pr-4 mr-4' : ''
            }`}
          >
            <Icon size={12} className="text-text-muted shrink-0" />
            <span className="text-[10px] uppercase tracking-widest text-text-muted font-semibold">
              {label}
            </span>
            <span className="text-[11px] font-mono font-bold text-text-secondary ml-auto">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
