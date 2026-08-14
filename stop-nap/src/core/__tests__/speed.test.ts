import { buildSimTrack } from '../simTrack';
import {
  estimateSpeed,
  fixAgeSec,
  median,
  percentile,
  scoreConfidence,
  segmentSpeeds,
} from '../speed';
import { DEFAULT_SETTINGS, type Fix } from '../types';

const DEST = { latitude: 40.7527, longitude: -73.9772 };
const ORIGIN = { latitude: 40.8527, longitude: -73.9772 };
const T0 = 1_700_000_000_000;

/** buildSimTrack emits oldest-first; the trip buffer is newest-first. */
const newestFirst = (fixes: Fix[]): Fix[] => [...fixes].reverse();

describe('percentile', () => {
  it('interpolates between samples', () => {
    expect(percentile([1, 2, 3, 4], 0.5)).toBeCloseTo(2.5);
    expect(percentile([1, 2, 3, 4], 0)).toBe(1);
    expect(percentile([1, 2, 3, 4], 1)).toBe(4);
    expect(percentile([10], 0.9)).toBe(10);
  });

  it('is order-independent', () => {
    expect(percentile([4, 1, 3, 2], 0.5)).toBeCloseTo(median([1, 2, 3, 4]));
  });

  it('returns NaN for an empty set', () => {
    expect(Number.isNaN(percentile([], 0.5))).toBe(true);
  });
});

describe('segmentSpeeds', () => {
  it('recovers the speed of a synthetic track', () => {
    const track = buildSimTrack({
      origin: ORIGIN,
      destination: DEST,
      speedMps: 12,
      intervalSec: 5,
      startTime: T0,
    });
    const speeds = segmentSpeeds(newestFirst(track));
    expect(speeds.length).toBeGreaterThan(10);
    for (const s of speeds) expect(s).toBeCloseTo(12, 1);
  });

  it('ignores sub-second segments as jitter', () => {
    const fixes: Fix[] = [
      { ...DEST, timestamp: T0 + 500, accuracy: 10 },
      { ...DEST, timestamp: T0, accuracy: 10 },
    ];
    expect(segmentSpeeds(fixes)).toEqual([]);
  });

  it('discards physically impossible jumps', () => {
    const fixes: Fix[] = [
      { latitude: 51.5, longitude: -0.12, timestamp: T0 + 2000, accuracy: 10 },
      { latitude: 40.75, longitude: -73.97, timestamp: T0, accuracy: 10 },
    ];
    expect(segmentSpeeds(fixes)).toEqual([]);
  });

  it('stops at the edge of the speed window', () => {
    const fixes: Fix[] = [
      // ~56 m in 5 s: a plausible 11 m/s segment.
      { latitude: 40.7505, longitude: -73.97, timestamp: T0 + 600_000, accuracy: 10 },
      { latitude: 40.75, longitude: -73.97, timestamp: T0 + 595_000, accuracy: 10 },
      // 10 minutes older than the newest fix — outside the 5-minute window.
      { latitude: 40.74, longitude: -73.97, timestamp: T0, accuracy: 10 },
    ];
    const speeds = segmentSpeeds(fixes);
    expect(speeds).toHaveLength(1);
    expect(speeds[0]).toBeCloseTo(11.1, 0);
  });
});

describe('estimateSpeed', () => {
  it('uses observed displacement when it has enough segments', () => {
    const track = buildSimTrack({
      origin: ORIGIN,
      destination: DEST,
      speedMps: 20,
      intervalSec: 5,
      startTime: T0,
    });
    const est = estimateSpeed(newestFirst(track), DEFAULT_SETTINGS);
    expect(est.source).toBe('observed');
    expect(est.typical).toBeCloseTo(20, 0);
    expect(est.upper).toBeGreaterThan(est.typical);
  });

  it('falls back to the OS-reported speed with a single fix', () => {
    const fixes: Fix[] = [{ ...DEST, timestamp: T0, accuracy: 10, speed: 9 }];
    const est = estimateSpeed(fixes, DEFAULT_SETTINGS);
    expect(est.source).toBe('os-reported');
    expect(est.typical).toBe(9);
  });

  it('falls back to the configured default with no usable data', () => {
    const est = estimateSpeed([], DEFAULT_SETTINGS);
    expect(est.source).toBe('default');
    expect(est.typical).toBe(DEFAULT_SETTINGS.defaultSpeedMps);
  });

  it('ignores a sentinel OS speed of -1', () => {
    const fixes: Fix[] = [{ ...DEST, timestamp: T0, accuracy: 10, speed: -1 }];
    expect(estimateSpeed(fixes, DEFAULT_SETTINGS).source).toBe('default');
  });

  it('never lets the optimistic bound fall below the safety floor', () => {
    // A stationary user: every segment is ~0 m/s.
    const fixes: Fix[] = Array.from({ length: 6 }, (_, i) => ({
      ...DEST,
      timestamp: T0 + (5 - i) * 5000,
      accuracy: 5,
    }));
    const est = estimateSpeed(fixes, DEFAULT_SETTINGS);
    expect(est.typical).toBeCloseTo(0, 3);
    // Without this floor the ETA would be infinite and the alarm would never fire.
    expect(est.upper).toBeGreaterThanOrEqual(3);
  });

  it('caps the optimistic bound so one wild fix cannot fire us hours early', () => {
    const fixes: Fix[] = [
      { latitude: 41.5, longitude: -73.97, timestamp: T0 + 60_000, accuracy: 10 },
      { latitude: 41.0, longitude: -73.97, timestamp: T0 + 30_000, accuracy: 10 },
      { latitude: 40.75, longitude: -73.97, timestamp: T0, accuracy: 10 },
    ];
    expect(estimateSpeed(fixes, DEFAULT_SETTINGS).upper).toBeLessThanOrEqual(45);
  });
});

describe('fixAgeSec', () => {
  it('is infinite with no fixes', () => {
    expect(fixAgeSec([], T0)).toBe(Infinity);
  });

  it('measures against the newest fix', () => {
    const fixes: Fix[] = [
      { ...DEST, timestamp: T0 - 30_000, accuracy: 10 },
      { ...DEST, timestamp: T0 - 90_000, accuracy: 10 },
    ];
    expect(fixAgeSec(fixes, T0)).toBeCloseTo(30);
  });
});

describe('scoreConfidence', () => {
  const fresh: Fix[] = [{ ...DEST, timestamp: T0, accuracy: 12 }];

  it('is LIVE for a fresh accurate fix', () => {
    expect(scoreConfidence(fresh, 'FINE', T0 + 5_000)).toBe('LIVE');
  });

  it('tightens the staleness bar as the power tier rises', () => {
    // 60 s old: healthy in COARSE, stale in FINE.
    expect(scoreConfidence(fresh, 'COARSE', T0 + 60_000)).toBe('LIVE');
    expect(scoreConfidence(fresh, 'FINE', T0 + 60_000)).toBe('DEGRADED');
  });

  it('degrades on poor accuracy even when fresh', () => {
    const sloppy: Fix[] = [{ ...DEST, timestamp: T0, accuracy: 300 }];
    expect(scoreConfidence(sloppy, 'FINE', T0 + 1_000)).toBe('DEGRADED');
  });

  it('goes DARK past three minutes — the tunnel case', () => {
    expect(scoreConfidence(fresh, 'FINE', T0 + 200_000)).toBe('DARK');
  });

  it('goes DARK with no fixes at all', () => {
    expect(scoreConfidence([], 'FINE', T0)).toBe('DARK');
  });
});
