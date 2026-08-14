import {
  EARTH_RADIUS_M,
  bearingDeg,
  destinationPoint,
  distanceM,
  formatDistance,
  formatEta,
  interpolate,
} from '../geo';

/** One degree of latitude at the mean Earth radius. */
const DEG_LAT_M = (EARTH_RADIUS_M * Math.PI) / 180;

describe('distanceM', () => {
  it('measures one degree of latitude', () => {
    const d = distanceM(
      { latitude: 0, longitude: 0 },
      { latitude: 1, longitude: 0 },
    );
    expect(d).toBeCloseTo(DEG_LAT_M, 1);
  });

  it('measures one degree of longitude at the equator', () => {
    const d = distanceM(
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 1 },
    );
    expect(d).toBeCloseTo(DEG_LAT_M, 1);
  });

  it('shrinks longitude degrees toward the pole', () => {
    const equator = distanceM(
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 1 },
    );
    const high = distanceM(
      { latitude: 60, longitude: 0 },
      { latitude: 60, longitude: 1 },
    );
    // cos(60°) = 0.5
    expect(high / equator).toBeCloseTo(0.5, 3);
  });

  it('is zero for identical points and symmetric otherwise', () => {
    const a = { latitude: 40.7527, longitude: -73.9772 };
    const b = { latitude: 40.7061, longitude: -74.0087 };
    expect(distanceM(a, a)).toBe(0);
    expect(distanceM(a, b)).toBeCloseTo(distanceM(b, a), 6);
  });

  it('handles the antimeridian without blowing up', () => {
    const d = distanceM(
      { latitude: 0, longitude: 179.9 },
      { latitude: 0, longitude: -179.9 },
    );
    expect(d).toBeCloseTo(DEG_LAT_M * 0.2, 0);
  });
});

describe('bearingDeg', () => {
  it('reports cardinal directions', () => {
    const o = { latitude: 0, longitude: 0 };
    expect(bearingDeg(o, { latitude: 1, longitude: 0 })).toBeCloseTo(0, 6);
    expect(bearingDeg(o, { latitude: 0, longitude: 1 })).toBeCloseTo(90, 6);
    expect(bearingDeg(o, { latitude: -1, longitude: 0 })).toBeCloseTo(180, 6);
    expect(bearingDeg(o, { latitude: 0, longitude: -1 })).toBeCloseTo(270, 6);
  });
});

describe('destinationPoint', () => {
  it('round-trips against distanceM', () => {
    const origin = { latitude: 51.5074, longitude: -0.1278 };
    const moved = destinationPoint(origin, 42, 5000);
    expect(distanceM(origin, moved)).toBeCloseTo(5000, 3);
    expect(bearingDeg(origin, moved)).toBeCloseTo(42, 3);
  });

  it('normalises longitude across the antimeridian', () => {
    const moved = destinationPoint(
      { latitude: 0, longitude: 179.99 },
      90,
      5000,
    );
    expect(moved.longitude).toBeLessThan(0);
    expect(moved.longitude).toBeGreaterThan(-180);
  });
});

describe('interpolate', () => {
  it('returns the endpoints at t=0 and t=1', () => {
    const a = { latitude: 1, longitude: 2 };
    const b = { latitude: 3, longitude: 6 };
    expect(interpolate(a, b, 0)).toEqual(a);
    expect(interpolate(a, b, 1)).toEqual(b);
    expect(interpolate(a, b, 0.5)).toEqual({ latitude: 2, longitude: 4 });
  });
});

describe('formatting', () => {
  it('formats distances a sleepy person can read', () => {
    expect(formatDistance(null)).toBe('—');
    expect(formatDistance(0)).toBe('0 m');
    expect(formatDistance(437)).toBe('440 m');
    expect(formatDistance(1250)).toBe('1.3 km');
    expect(formatDistance(12500)).toBe('13 km');
  });

  it('formats ETAs as m:ss', () => {
    expect(formatEta(null)).toBe('—');
    expect(formatEta(0)).toBe('now');
    expect(formatEta(-5)).toBe('now');
    expect(formatEta(65)).toBe('1:05');
    expect(formatEta(600)).toBe('10:00');
  });
});
