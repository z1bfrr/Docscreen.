/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:              '#080C14',
        'bg-2':          '#0C1220',
        surface:         '#111827',
        'surface-raised':'#1A2236',
        'surface-high':  '#1F2D47',
        accent:          '#F59E0B',
        'accent-dim':    '#D97706',
        'accent-glow':   'rgba(245,158,11,0.15)',
        'accent-ring':   'rgba(245,158,11,0.35)',
        'status-ok':     '#10B981',
        'status-ok-dim': 'rgba(16,185,129,0.15)',
        'status-warn':   '#F59E0B',
        'status-warn-dim':'rgba(245,158,11,0.15)',
        'status-error':  '#EF4444',
        'status-error-dim':'rgba(239,68,68,0.15)',
        'text-primary':  '#F1F5F9',
        'text-secondary':'#CBD5E1',
        'text-muted':    '#64748B',
        'text-faint':    '#334155',
        border:          '#1E293B',
        'border-bright': '#2D3F5F',
        'indigo':        '#6366F1',
        'indigo-dim':    'rgba(99,102,241,0.15)',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      fontSize: {
        'hero': ['80px', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        card:  '12px',
        'card-lg': '16px',
        input: '8px',
        pill:  '9999px',
      },
      borderColor: {
        DEFAULT: '#1E293B',
      },
      boxShadow: {
        'glow-accent': '0 0 24px rgba(245,158,11,0.2)',
        'glow-ok':     '0 0 20px rgba(16,185,129,0.18)',
        'glow-error':  '0 0 20px rgba(239,68,68,0.18)',
        'card':        '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':  '0 8px 32px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-card': 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)',
        'gradient-hero': 'linear-gradient(135deg, #111827 0%, #0C1220 100%)',
        'gradient-accent': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #0C1220 0%, #080C14 100%)',
      },
    },
  },
  plugins: [],
};
