export const colors = {
  surface: '#f7f9fb',
  surfaceDim: '#d8dadc',
  surfaceBright: '#f7f9fb',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f2f4f6',
  surfaceContainer: '#eceef0',
  surfaceContainerHigh: '#e6e8ea',
  surfaceContainerHighest: '#e0e3e5',
  onSurface: '#191c1e',
  onSurfaceVariant: '#434655',
  inverseSurface: '#2d3133',
  inverseOnSurface: '#eff1f3',
  outline: '#747686',
  outlineVariant: '#c4c5d7',
  surfaceTint: '#2151da',
  primary: '#1D4ED8', // Sapphire
  onPrimary: '#ffffff',
  primaryContainer: '#DBEAFE', // SapphireLight
  onPrimaryContainer: '#0F172A',
  inversePrimary: '#b7c4ff',
  secondary: '#565e74',
  onSecondary: '#ffffff',
  secondaryContainer: '#dae2fd',
  onSecondaryContainer: '#5c647a',
  tertiary: '#06B6D4', // CyanTeal
  onTertiary: '#ffffff',
  tertiaryContainer: '#006577',
  onTertiaryContainer: '#75e3ff',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  background: '#F8FAFC', // Canvas
  onBackground: '#191c1e',
  surfaceVariant: '#e0e3e5',
  
  // Android Specific Custom Accents
  sapphire: '#1D4ED8',
  sapphireLight: '#DBEAFE',
  deepSlate: '#0F172A',
  cyanTeal: '#06B6D4',
  emerald: '#10B981',
  emeraldDark: '#047857',
  slate300: '#CBD5E1',
  slate500: '#64748B',
  slate700: '#334155',
  amberWarning: '#F59E0B',
};

export const spacing = {
  gutter: 24,
  gutterSm: 16,
  gutterLg: 32,
  margin: 24,
  marginMd: 48,
  marginLg: 80,
  spaceXs: 4,
  spaceSm: 8,
  spaceMd: 16,
  spaceLg: 24,
  spaceXl: 40,
};

export const rounded = {
  sm: 8,
  md: 16, // DEFAULT
  lg: 24,
  xl: 32, // Floating
  full: 9999,
};

// We will use standard React Native fonts (sans-serif) for this demo, 
// as Plus Jakarta Sans and Manrope require loading custom assets.
export const fonts = {
  displayLg: { fontSize: 36, fontWeight: '700' as const, lineHeight: 44, letterSpacing: -0.5 },
  headlineXl: { fontSize: 28, fontWeight: '600' as const, lineHeight: 36, letterSpacing: -0.5 },
  headlineLg: { fontSize: 32, fontWeight: '600' as const, lineHeight: 40, letterSpacing: -0.5 },
  headlineMd: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32, letterSpacing: -0.5 },
  headlineSm: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28, letterSpacing: -0.5 },
  bodyXl: { fontSize: 18, fontWeight: '400' as const, lineHeight: 28 },
  bodyLg: { fontSize: 16, fontWeight: '400' as const, lineHeight: 26 },
  bodyMd: { fontSize: 14, fontWeight: '400' as const, lineHeight: 22 },
  bodySm: { fontSize: 12, fontWeight: '500' as const, lineHeight: 18 },
  labelLg: { fontSize: 15, fontWeight: '600' as const, lineHeight: 20 },
  labelMd: { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  labelSm: { fontSize: 11, fontWeight: '700' as const, lineHeight: 16, letterSpacing: 0.5, textTransform: 'uppercase' as const },
};
