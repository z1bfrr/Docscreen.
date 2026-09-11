import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

import { Toggle } from '../components/ui/Toggle';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';

interface FormState {
  deviceName: string;
  fullWeight: string;
  lowThreshold: string;
  updateInterval: string;
  liveDemo: boolean;
}

interface FormErrors {
  deviceName?: string;
  fullWeight?: string;
  lowThreshold?: string;
  updateInterval?: string;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.deviceName.trim()) {
    errors.deviceName = 'Device name is required.';
  } else if (form.deviceName.length > 32) {
    errors.deviceName = 'Max 32 characters.';
  }

  const fw = parseFloat(form.fullWeight);
  if (isNaN(fw) || fw < 1 || fw > 100) {
    errors.fullWeight = 'Must be between 1 and 100 kg.';
  }

  const lt = parseFloat(form.lowThreshold);
  if (isNaN(lt) || lt < 0) {
    errors.lowThreshold = 'Must be 0 or greater.';
  } else if (!isNaN(fw) && lt >= fw) {
    errors.lowThreshold = 'Must be less than full weight.';
  }

  const ui = parseInt(form.updateInterval, 10);
  if (isNaN(ui) || ui < 1 || ui > 60) {
    errors.updateInterval = 'Must be between 1 and 60 seconds.';
  }

  return errors;
}

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  suffix?: string;
}

function Field({ id, label, hint, type = 'text', value, onChange, error, placeholder, min, max, maxLength, suffix }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-text-primary">
        {label}
      </label>
      {hint && <p className="text-xs text-text-muted -mt-0.5">{hint}</p>}
      <div className="relative">
        <input
          id={id}
          type={type}
          min={min}
          max={max}
          maxLength={maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full bg-surface-raised border rounded-input px-3 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-muted outline-none transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 ${
            error ? 'border-status-error ring-1 ring-status-error/20' : 'border-border hover:border-border-bright'
          } ${suffix ? 'pr-10' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted font-mono pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs text-status-error" role="alert">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

export function Settings() {
  const { settings, updateSettings } = useSettings();
  const [form, setForm] = useState<FormState>({
    deviceName: settings.deviceName,
    fullWeight: String(settings.fullWeight),
    lowThreshold: String(settings.lowThreshold),
    updateInterval: String(settings.updateInterval),
    liveDemo: settings.liveDemo,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    updateSettings({ liveDemo: form.liveDemo });
  }, [form.liveDemo]);

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    updateSettings({
      deviceName: form.deviceName.trim(),
      fullWeight: parseFloat(form.fullWeight),
      lowThreshold: parseFloat(form.lowThreshold),
      updateInterval: parseInt(form.updateInterval, 10),
      liveDemo: form.liveDemo,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="px-4 py-6 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-bold text-text-primary tracking-tight">Settings</h1>
          <p className="text-xs text-text-muted mt-1">Configure your device and thresholds</p>
        </div>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); handleSave(); }}
        className="max-w-[480px] flex flex-col gap-6"
        noValidate
      >
        {/* Device section */}
        <div className="glass-card rounded-card p-5 flex flex-col gap-5">
          <div className="pb-3 border-b border-border">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest">Device</h2>
          </div>
          <Field
            id="deviceName"
            label="Device Name"
            hint="Displayed in the dashboard header"
            value={form.deviceName}
            onChange={(v) => handleChange('deviceName', v)}
            error={errors.deviceName}
            placeholder="ESP32-01"
            maxLength={32}
          />
          <p className="text-[10px] text-text-muted -mt-4">
            {form.deviceName.length}/32 characters
          </p>
        </div>

        {/* Thresholds section */}
        <div className="glass-card rounded-card p-5 flex flex-col gap-5">
          <div className="pb-3 border-b border-border">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest">Thresholds</h2>
          </div>
          <Field
            id="fullWeight"
            label="Full Weight"
            hint="Weight of a full cylinder — used as 100% reference"
            type="number"
            min={1}
            max={100}
            value={form.fullWeight}
            onChange={(v) => handleChange('fullWeight', v)}
            error={errors.fullWeight}
            placeholder="25"
            suffix="kg"
          />
          <Field
            id="lowThreshold"
            label="Low Weight Threshold"
            hint="Below this weight the status changes to LOW"
            type="number"
            min={0}
            value={form.lowThreshold}
            onChange={(v) => handleChange('lowThreshold', v)}
            error={errors.lowThreshold}
            placeholder="5"
            suffix="kg"
          />
          <Field
            id="updateInterval"
            label="Update Interval"
            hint="How often the sensor emits a new reading (1–60 seconds)"
            type="number"
            min={1}
            max={60}
            value={form.updateInterval}
            onChange={(v) => handleChange('updateInterval', v)}
            error={errors.updateInterval}
            placeholder="3"
            suffix="s"
          />
        </div>

        {/* Live Demo Toggle */}
        <div className="glass-card rounded-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">Live Demo</p>
              <p className="text-xs text-text-muted mt-1">
                When off, all readings freeze at their last value
              </p>
            </div>
            <Toggle
              id="liveDemo-settings"
              checked={form.liveDemo}
              onChange={(val) => handleChange('liveDemo', val)}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button
            id="save-settings-btn"
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-input text-sm font-bold text-bg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}
          >
            <Save size={15} />
            Save Settings
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-status-ok font-semibold animate-pulse">
              <CheckCircle2 size={15} />
              Saved!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
