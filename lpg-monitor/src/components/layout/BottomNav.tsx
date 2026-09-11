import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, Settings } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/history', label: 'History', Icon: History },
  { to: '/settings', label: 'Settings', Icon: Settings },
];

export function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 pb-safe z-50 border-t border-border"
      style={{ background: 'linear-gradient(180deg, rgba(8,12,20,0.95) 0%, #080C14 100%)', backdropFilter: 'blur(20px)' }}
      aria-label="Mobile navigation"
    >
      <div className="flex h-[60px]">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-semibold tracking-wide transition-all duration-200 relative ${
                isActive ? 'text-accent' : 'text-text-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active pill indicator at top */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-accent" />
                )}
                <div
                  className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-all duration-200 ${
                    isActive ? 'bg-accent/15' : ''
                  }`}
                >
                  <Icon size={17} />
                </div>
                <span className="uppercase tracking-widest" style={{ fontSize: '9px' }}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
