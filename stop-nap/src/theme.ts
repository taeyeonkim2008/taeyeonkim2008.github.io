/**
 * A dark palette, not as a style preference but because the app is used on a
 * dim train at night by someone about to sleep. A white screen at 11pm is
 * hostile, and the alarm needs to be the only bright thing the app ever does.
 *
 * Touch targets are oversized throughout for the same reason: every tap in the
 * arming flow is made by someone already tired.
 */

export const colors = {
  bg: '#0B1020',
  surface: '#151B2E',
  surfaceRaised: '#1E2740',
  border: '#2A3350',

  text: '#F2F5FF',
  textDim: '#98A2C0',
  textFaint: '#5C6890',

  accent: '#3B82F6',
  accentDim: '#1E4FA8',

  live: '#34D399',
  degraded: '#FBBF24',
  dark: '#F87171',

  alarm: '#DC2626',
  alarmDeep: '#7F1D1D',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
};

/** Minimum height for anything a sleepy thumb has to hit. */
export const TOUCH_TARGET = 56;

export const confidenceColor = (
  confidence: 'LIVE' | 'DEGRADED' | 'DARK',
): string =>
  confidence === 'LIVE'
    ? colors.live
    : confidence === 'DEGRADED'
      ? colors.degraded
      : colors.dark;

export const confidenceLabel = (
  confidence: 'LIVE' | 'DEGRADED' | 'DARK',
): string =>
  confidence === 'LIVE'
    ? 'GPS good'
    : confidence === 'DEGRADED'
      ? 'GPS weak'
      : 'No GPS — estimating';
