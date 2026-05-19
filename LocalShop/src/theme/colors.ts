export const colors = {
  background: '#0B0B0F',
  surface: '#16161D',
  surfaceElevated: '#1E1E28',
  surfaceMuted: '#252530',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.14)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.72)',
  textMuted: 'rgba(255, 255, 255, 0.48)',
  primary: '#5B9FD4',
  primaryDark: '#3D7AB5',
  accent: '#7EC8A3',
  warning: '#F5C451',
  danger: '#FF6B6B',
  headerGradient: ['#12121A', '#1A2235', '#0B0B0F'] as const,
};

export const categoryGradients: Record<string, readonly [string, string]> = {
  default: ['#3D4F6F', '#2A3548'],
  Bakery: ['#5C4A3A', '#3D2E22'],
  'Farmers Market': ['#3A5C42', '#243D2A'],
  'Specialty Food': ['#5C3A4A', '#3D2430'],
  Coffee: ['#4A3D2E', '#2E2418'],
  Grocery: ['#3A4A5C', '#24303D'],
};
