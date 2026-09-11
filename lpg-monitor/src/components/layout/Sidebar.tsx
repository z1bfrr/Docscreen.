import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, Settings, Flame } from 'lucide-react';
import { useSensor } from '../../context/SensorContext';

const navItems = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard, desc: 'Live readings' },
  { to: '/history', label: 'History', Icon: History, desc: 'Weight trends' },
  { to: '/settings', label: 'Settings', Icon: Settings, desc: 'Configure device' },
];

export function Sidebar() {
  const { isSupabase, deviceStatus } = useSensor();
  return (
    <nav
      className="hidden md:flex flex-col w-64 shrink-0 h-full border-r border-border"
      style={{ background: 'linear-gradient(180deg, #0C1220 0%, #080C14 100%)' }}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="px-5 pt-7 pb-5 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Icon mark */}
          <div
            className="w-9 h-9 rounded-card flex items-center justify-center shrink-0 glow-accent"
            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}
          >
            <Flame size={18} className="text-bg" />
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary tracking-tight leading-tight">
              LPG Monitor
            </div>
            <div className="text-[11px] text-text-muted font-medium mt-0.5">
              IoT Safety Dashboard
            </div>
          </div>
        </div>
      </div>

      {/* Nav section label */}
      <div className="px-5 pt-5 pb-1.5">
        <span className="text-[10px] uppercase tracking-widest text-text-faint font-semibold">
          Navigation
        </span>
      </div>

      {/* Nav links */}
      <div className="flex flex-col gap-1 px-3 flex-1">
        {navItems.map(({ to, label, Icon, desc }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-card text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'text-accent nav-active-pill border border-accent/20'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface-raised border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active left bar */}
                {isActive && (
                  <span
                    className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-full bg-accent"
                  />
                )}
                <div
                  className={`w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isActive
                      ? 'bg-accent/15'
                      : 'bg-surface-raised group-hover:bg-surface-high'
                  }`}
                >
                  <Icon
                    size={16}
                    className={isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary transition-colors duration-200'}
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="leading-tight">{label}</span>
                  <span className={`text-[11px] font-normal leading-tight mt-0.5 ${isActive ? 'text-accent/60' : 'text-text-faint group-hover:text-text-muted'}`}>
                    {desc}
                  </span>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isSupabase
                ? deviceStatus.connected ? 'bg-status-ok pulse-dot' : 'bg-status-error'
                : 'bg-accent pulse-dot'
            }`}
          />
          <p className="text-[11px] text-text-muted font-mono">
            {isSupabase
              ? deviceStatus.connected ? 'Supabase · Live' : 'Supabase · Connecting…'
              : 'v1.0.0 · Mock Mode'}
          </p>
        </div>
      </div>
    </nav>
  );
}
