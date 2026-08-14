/**
 * Speed estimation and confidence scoring.
 *
 * The OS-reported instantaneous speed on a `Fix` is unreliable on transit —
 * it's derived from Doppler shift and goes to -1 or 0 the moment the signal
 * degrades, which on a subway is precisely when we need it. So we derive speed
 * from displacement between fixes and treat the OS value only as a last resort.
 *
 * Everything here is pure.
 */

import { distanceM } from './geo';
import type { Confidence, Fix, PowerTier, TripSettings } from './types';

/** How far back we look when estimating speed. */
export const SPEED_WINDOW_MS = 5 * 60 * 1000;

/** Segments shorter than this are dominated by GPS jitter, not motion. */
const MIN_SEGMENT_MS = 1000;

/** Anything above this is a bad fix, not a fast train. Filtered out entirely. */
const MAX_PLAUSIBLE_MPS = 90;

/**
 * The optimistic speed bound is never allowed below this. If we believed the
 * user was crawling at 0.3 m/s the computed ETA would be enormous and the
 * alarm would never fire — the clamp guarantees the countdown keeps moving.
 */
const UPPER_CLAMP_MIN_MPS = 3;

/** Nor above this, so one wild fix can't make us fire hours early. */
const UPPER_CLAMP_MAX_MPS = 45;

/** Headroom applied to the observed p90 to get the optimistic bound. */
const UPPER_MULTIPLIER = 1.15;

export interface SpeedEstimate {
  /** Best guess, m/s. Drives the ETA we show the user. */
  typical: number;
  /** Optimistic (fast) bound, m/s. Drives the fire test. Always >= typical. */
  upper: number;
  /** Number of usable segments the estimate came from. */
  samples: number;
  source: 'observed' | 'os-reported' | 'default';
}

/** Linear-interpolated percentile over an unsorted array. */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 1) return sorted[0];
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function median(values: number[]): number {
  return percentile(values, 0.5);
}

/**
 * `fixes` must be newest-first. Returns the pairwise ground speeds (m/s) of
 * every usable segment inside the speed window.
 */
export function segmentSpeeds(fixes: Fix[]): number[] {
  if (fixes.length < 2) return [];
  const newest = fixes[0].timestamp;
  const speeds: number[] = [];

  for (let i = 0; i < fixes.length - 1; i++) {
    const a = fixes[i];
    const b = fixes[i + 1];
    if (newest - b.timestamp > SPEED_WINDOW_MS) break;

    const dtMs = a.timestamp - b.timestamp;
    if (dtMs < MIN_SEGMENT_MS) continue;

    const mps = (distanceM(a, b) / dtMs) * 1000;
    if (!Number.isFinite(mps) || mps > MAX_PLAUSIBLE_MPS) continue;
    speeds.push(mps);
  }

  return speeds;
}

/**
 * Derives typical and optimistic speed bounds from the fix buffer.
 *
 * The `upper` bound is deliberately generous: every metre of uncertainty it
 * adds moves the alarm *earlier*, which is the direction we want to be wrong in.
 */
export function estimateSpeed(
  fixes: Fix[],
  settings: TripSettings,
): SpeedEstimate {
  const speeds = segmentSpeeds(fixes);

  if (speeds.length >= 2) {
    const typical = median(speeds);
    const upper = clampUpper(percentile(speeds, 0.9) * UPPER_MULTIPLIER, typical);
    return { typical, upper, samples: speeds.length, source: 'observed' };
  }

  if (speeds.length === 1) {
    // One segment is thin evidence, so widen the bound rather than trust it.
    const typical = speeds[0];
    const upper = clampUpper(typical * 1.5, typical);
    return { typical, upper, samples: 1, source: 'observed' };
  }

  const osSpeed = fixes[0]?.speed;
  if (typeof osSpeed === 'number' && osSpeed > 0 && osSpeed < MAX_PLAUSIBLE_MPS) {
    return {
      typical: osSpeed,
      upper: clampUpper(osSpeed * 1.5, osSpeed),
      samples: 0,
      source: 'os-reported',
    };
  }

  return {
    typical: settings.defaultSpeedMps,
    upper: clampUpper(settings.defaultSpeedMps * 1.5, settings.defaultSpeedMps),
    samples: 0,
    source: 'default',
  };
}

function clampUpper(value: number, typical: number): number {
  const floor = Math.max(UPPER_CLAMP_MIN_MPS, typical);
  return Math.min(UPPER_CLAMP_MAX_MPS, Math.max(floor, value));
}

/** Age of the newest fix in seconds. Infinity when there are no fixes at all. */
export function fixAgeSec(fixes: Fix[], now: number): number {
  if (fixes.length === 0) return Infinity;
  return Math.max(0, (now - fixes[0].timestamp) / 1000);
}

/**
 * Staleness thresholds are tier-dependent: in DORMANT we only expect a fix
 * every few minutes, so a 90-second-old fix there is healthy, whereas in FINE
 * it means something has gone wrong.
 */
const LIVE_MAX_AGE_SEC: Record<PowerTier, number> = {
  DORMANT: 300,
  COARSE: 90,
  FINE: 20,
};

const DEGRADED_MAX_AGE_SEC = 180;
const LIVE_MAX_ACCURACY_M = 100;
const DEGRADED_MAX_ACCURACY_M = 500;

/**
 * Scores how much we trust our position knowledge. DARK is the tunnel case and
 * is what switches the trigger over to pure dead reckoning.
 */
export function scoreConfidence(
  fixes: Fix[],
  tier: PowerTier,
  now: number,
): Confidence {
  const age = fixAgeSec(fixes, now);
  if (!Number.isFinite(age)) return 'DARK';

  const accuracy = fixes[0].accuracy;

  if (age <= LIVE_MAX_AGE_SEC[tier] && accuracy <= LIVE_MAX_ACCURACY_M) {
    return 'LIVE';
  }
  if (age <= DEGRADED_MAX_AGE_SEC && accuracy <= DEGRADED_MAX_ACCURACY_M) {
    return 'DEGRADED';
  }
  return 'DARK';
}
