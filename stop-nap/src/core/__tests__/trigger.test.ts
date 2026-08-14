import { destinationPoint, distanceM } from '../geo';
import { buildTunnelCommute } from '../simTrack';
import {
  ARM_GRACE_MS,
  applyFix,
  applyGeofenceEnter,
  decide,
  markFired,
  project,
} from '../trigger';
import {
  DEFAULT_SETTINGS,
  type Destination,
  type Fix,
  type FireReason,
  type TripState,
} from '../types';

const T0 = 1_700_000_000_000;

const DEST: Destination = {
  id: 'grand-central',
  label: 'Grand Central',
  latitude: 40.7527,
  longitude: -73.9772,
  lastUsedAt: 0,
  useCount: 0,
  isFavorite: false,
};

/** A fix `distance` metres due north of the destination. */
function fixAt(
  distance: number,
  timestamp: number,
  accuracy = 12,
): Fix {
  return {
    ...destinationPoint(DEST, 0, distance),
    timestamp,
    accuracy,
  };
}

/**
 * Builds a newest-first buffer approaching the destination at `speedMps`,
 * ending `endDistance` metres out at `endTime`.
 */
function approach(
  endDistance: number,
  endTime: number,
  speedMps: number,
  count = 8,
  stepSec = 10,
): Fix[] {
  const fixes: Fix[] = [];
  for (let i = 0; i < count; i++) {
    fixes.push(
      fixAt(endDistance + i * speedMps * stepSec, endTime - i * stepSec * 1000),
    );
  }
  return fixes; // already newest-first
}

function makeTrip(over: Partial<TripState> = {}): TripState {
  return {
    phase: 'ARMED',
    destination: DEST,
    settings: { ...DEFAULT_SETTINGS },
    armedAt: T0,
    distanceAtArmM: 10_000,
    fixes: [],
    innerGeofenceEntered: false,
    minDistanceSeenM: null,
    hasFired: false,
    powerTier: 'COARSE',
    ...over,
  };
}

/** Asserts a FIRE with a specific reason and returns the decision. */
function expectFire(trip: TripState, now: number, reason: FireReason) {
  const d = decide(trip, now);
  expect({ action: d.action, reason: d.reason }).toEqual({
    action: 'FIRE',
    reason,
  });
  return d;
}

describe('guards', () => {
  it('holds while not armed', () => {
    const now = T0 + 600_000;
    const fixes = approach(200, now, 15);
    for (const phase of ['IDLE', 'DISMISSED', 'SNOOZED'] as const) {
      const trip = makeTrip({ phase, fixes });
      expect(decide(trip, now).action).toBe('HOLD');
    }
  });

  it('holds once the alarm has already fired', () => {
    const now = T0 + 600_000;
    const trip = makeTrip({ fixes: approach(200, now, 15), hasFired: true });
    expect(decide(trip, now).action).toBe('HOLD');
  });

  it('holds during the arm grace window so the UI can settle', () => {
    const now = T0 + ARM_GRACE_MS - 1;
    const trip = makeTrip({
      armedAt: T0,
      fixes: approach(200, now, 15),
      distanceAtArmM: 200,
    });
    expect(decide(trip, now).action).toBe('HOLD');

    // One millisecond past the grace window it fires.
    const after = T0 + ARM_GRACE_MS + 1;
    const trip2 = makeTrip({
      armedAt: T0,
      fixes: approach(200, after, 15),
      distanceAtArmM: 200,
    });
    expect(decide(trip2, after).action).toBe('FIRE');
  });
});

describe('live GPS', () => {
  it('holds when comfortably far out', () => {
    const now = T0 + 600_000;
    const trip = makeTrip({ fixes: approach(5000, now, 15) });
    const d = decide(trip, now);
    expect(d.action).toBe('HOLD');
    expect(d.confidence).toBe('LIVE');
    expect(d.distanceM).toBeCloseTo(5000, 0);
  });

  it('fires when the earliest plausible arrival reaches the lead time', () => {
    const now = T0 + 600_000;
    const trip = makeTrip({ fixes: approach(1200, now, 15) });
    const d = expectFire(trip, now, 'ETA_LIVE');
    expect(d.etaEarliestSec!).toBeLessThanOrEqual(
      DEFAULT_SETTINGS.leadTimeSec,
    );
  });

  it('fires further out for a faster train, at the same lead time', () => {
    const now = T0 + 600_000;
    const slow = makeTrip({ fixes: approach(1200, now, 8) });
    const fast = makeTrip({ fixes: approach(1200, now, 30) });
    expect(decide(slow, now).action).toBe('HOLD');
    expect(decide(fast, now).action).toBe('FIRE');
  });

  it('respects a configured lead time', () => {
    const now = T0 + 600_000;
    const fixes = approach(2500, now, 15);
    const short = makeTrip({
      fixes,
      settings: { ...DEFAULT_SETTINGS, leadTimeSec: 30 },
    });
    const long = makeTrip({
      fixes,
      settings: { ...DEFAULT_SETTINGS, leadTimeSec: 300 },
    });
    expect(decide(short, now).action).toBe('HOLD');
    expect(decide(long, now).action).toBe('FIRE');
  });
});

describe('geofence', () => {
  it('fires on the inner region regardless of the computed ETA', () => {
    const now = T0 + 600_000;
    // Deliberately far out: only the geofence event should matter.
    const trip = applyGeofenceEnter(
      makeTrip({ fixes: approach(5000, now, 15) }),
      'inner',
    );
    expectFire(trip, now, 'GEOFENCE_INNER');
  });

  it('ignores the outer and mid rings as fire triggers', () => {
    const now = T0 + 600_000;
    let trip = makeTrip({ fixes: approach(5000, now, 15) });
    trip = applyGeofenceEnter(trip, 'outer');
    trip = applyGeofenceEnter(trip, 'mid');
    expect(decide(trip, now).action).toBe('HOLD');
    expect(trip.innerGeofenceEntered).toBe(false);
  });
});

describe('overshoot', () => {
  it('fires immediately once we are measurably moving away', () => {
    const now = T0 + 600_000;
    const trip = makeTrip({
      fixes: approach(3000, now, 15),
      minDistanceSeenM: 300,
    });
    expectFire(trip, now, 'OVERSHOOT');
  });

  it('tolerates jitter below the threshold', () => {
    const now = T0 + 600_000;
    const trip = makeTrip({
      fixes: approach(3000, now, 15),
      minDistanceSeenM: 2900, // only 100 m of recession
    });
    expect(decide(trip, now).action).toBe('HOLD');
  });

  it('does not fire on dead-reckoned distance, which can only shrink', () => {
    const lastFix = T0 + 100_000;
    const now = lastFix + 200_000; // DARK
    const trip = makeTrip({
      fixes: approach(9000, lastFix, 1),
      minDistanceSeenM: 300,
      distanceAtArmM: 30_000,
    });
    const d = decide(trip, now);
    expect(d.confidence).toBe('DARK');
    expect(d.reason).not.toBe('OVERSHOOT');
  });
});

describe('tunnel / dead reckoning', () => {
  it('keeps counting down with no fixes and fires while dark', () => {
    const lastFix = T0 + 60_000;
    const now = lastFix + 250_000;
    const trip = makeTrip({ fixes: approach(5000, lastFix, 15) });
    const d = expectFire(trip, now, 'ETA_DEAD_RECKONED');
    expect(d.confidence).toBe('DARK');
  });

  it('fires strictly earlier as the fix goes stale', () => {
    const lastFix = T0 + 60_000;
    const fixes = approach(5000, lastFix, 15);
    const trip = makeTrip({ fixes });

    const fresh = decide(trip, lastFix + 1_000).etaEarliestSec!;
    const stale = decide(trip, lastFix + 60_000).etaEarliestSec!;
    const staler = decide(trip, lastFix + 120_000).etaEarliestSec!;

    // Uncertainty must move the alarm toward the user, never away.
    expect(stale).toBeLessThan(fresh);
    expect(staler).toBeLessThan(stale);
  });

  it('fires even when no fix ever arrives after arming', () => {
    const trip = makeTrip({ fixes: [], distanceAtArmM: 20_000 });
    expect(decide(trip, T0 + 300_000).action).toBe('HOLD');
    const d = expectFire(trip, T0 + 900_000, 'ETA_DEAD_RECKONED');
    expect(d.confidence).toBe('DARK');
  });

  it('fail-loud off fires later than fail-loud on', () => {
    const lastFix = T0 + 60_000;
    const fixes = approach(5000, lastFix, 15);
    const loud = makeTrip({ fixes });
    const quiet = makeTrip({
      fixes,
      settings: { ...DEFAULT_SETTINGS, failLoud: false },
    });

    const firstFire = (trip: TripState): number => {
      for (let t = 0; t < 3000; t += 5) {
        if (decide(trip, lastFix + t * 1000).action === 'FIRE') return t;
      }
      return Infinity;
    };

    expect(firstFire(loud)).toBeLessThan(firstFire(quiet));
  });
});

describe('lost-signal failsafe', () => {
  /**
   * The case this exists for: the signal died while the user was stationary —
   * sitting on a platform — so the speed estimate is stale-low and dead
   * reckoning still believes we are far away. Six minutes of silence inside
   * the failsafe radius is enough to wake them anyway.
   */
  const stationary = (distance: number, endTime: number): Fix[] =>
    Array.from({ length: 6 }, (_, i) =>
      fixAt(distance, endTime - i * 10_000, 5),
    );

  it('fires after a long blackout within the failsafe radius', () => {
    const lastFix = T0 + 60_000;
    const now = lastFix + 400_000;
    const trip = makeTrip({
      fixes: stationary(4000, lastFix),
      minDistanceSeenM: 4000,
    });

    // Dead reckoning alone would not have fired here.
    expect(decide(trip, now).etaEarliestSec!).toBeGreaterThan(
      DEFAULT_SETTINGS.leadTimeSec,
    );
    expectFire(trip, now, 'LOST_SIGNAL_FAILSAFE');
  });

  it('holds when the blackout is still short', () => {
    const lastFix = T0 + 60_000;
    const trip = makeTrip({
      fixes: stationary(4000, lastFix),
      minDistanceSeenM: 4000,
    });
    expect(decide(trip, lastFix + 200_000).action).toBe('HOLD');
  });

  it('holds when the last known position was far outside the radius', () => {
    const lastFix = T0 + 60_000;
    const trip = makeTrip({
      fixes: stationary(40_000, lastFix),
      minDistanceSeenM: 40_000,
      distanceAtArmM: 45_000,
    });
    expect(decide(trip, lastFix + 400_000).action).toBe('HOLD');
  });

  it('is suppressed when fail-loud is off', () => {
    const lastFix = T0 + 60_000;
    const trip = makeTrip({
      fixes: stationary(4000, lastFix),
      minDistanceSeenM: 4000,
      settings: { ...DEFAULT_SETTINGS, failLoud: false },
    });
    expect(decide(trip, lastFix + 400_000).action).toBe('HOLD');
  });
});

describe('power tier', () => {
  it('escalates as the destination approaches', () => {
    const now = T0 + 600_000;
    expect(
      decide(makeTrip({ fixes: approach(8000, now, 15) }), now).nextTier,
    ).toBe('COARSE');
    expect(
      decide(makeTrip({ fixes: approach(3000, now, 15) }), now).nextTier,
    ).toBe('COARSE');
    expect(
      decide(
        makeTrip({ fixes: approach(1000, now, 15), powerTier: 'DORMANT' }),
        now,
      ).nextTier,
    ).toBe('FINE');
  });

  it('never relaxes mid-trip, even if the distance estimate says it could', () => {
    const now = T0 + 600_000;
    const trip = makeTrip({ fixes: approach(9000, now, 15), powerTier: 'FINE' });
    expect(decide(trip, now).nextTier).toBe('FINE');
  });
});

describe('reducers', () => {
  it('keeps the fix buffer newest-first even for out-of-order delivery', () => {
    let trip = makeTrip();
    trip = applyFix(trip, fixAt(3000, T0 + 30_000));
    trip = applyFix(trip, fixAt(5000, T0 + 10_000)); // late arrival
    trip = applyFix(trip, fixAt(4000, T0 + 20_000));

    const stamps = trip.fixes.map((f) => f.timestamp);
    expect(stamps).toEqual([...stamps].sort((a, b) => b - a));
  });

  it('tracks the closest approach for overshoot detection', () => {
    let trip = makeTrip();
    trip = applyFix(trip, fixAt(3000, T0 + 10_000));
    trip = applyFix(trip, fixAt(400, T0 + 20_000));
    trip = applyFix(trip, fixAt(1800, T0 + 30_000));
    expect(trip.minDistanceSeenM).toBeCloseTo(400, 0);
  });

  it('marks the trip as fired exactly once', () => {
    const now = T0 + 600_000;
    let trip = makeTrip({ fixes: approach(1200, now, 15) });
    expect(decide(trip, now).action).toBe('FIRE');
    trip = markFired(trip);
    expect(trip.phase).toBe('ALARMING');
    expect(decide(trip, now).action).toBe('HOLD');
  });
});

describe('full simulated commute with a six-minute tunnel', () => {
  /**
   * The scenario the whole fallback chain exists for. The track runs 7.2 km at
   * 15 m/s (480 s of travel) and the GPS blacks out from t=120 s to the end, so
   * the final 6 minutes are entirely dead-reckoned. Nothing here may depend on
   * a fix arriving during the tunnel.
   */
  const { fixes: track } = buildTunnelCommute(DEST, T0);
  const arrivalSec = 480;

  function replay(settings = DEFAULT_SETTINGS) {
    let trip = makeTrip({
      settings,
      armedAt: T0,
      distanceAtArmM: distanceM(track[0], DEST),
      fixes: [],
    });

    let firedAt: number | null = null;
    let firedReason: FireReason | undefined;
    let queue = [...track];

    for (let t = 0; t <= arrivalSec + 120; t += 5) {
      const now = T0 + t * 1000;

      while (queue.length && queue[0].timestamp <= now) {
        trip = applyFix(trip, queue.shift()!);
      }

      const d = decide(trip, now);
      trip = { ...trip, powerTier: d.nextTier };

      if (d.action === 'FIRE' && firedAt == null) {
        firedAt = t;
        firedReason = d.reason;
        trip = markFired(trip);
      }
    }

    return { firedAt, firedReason, trip };
  }

  it('receives no fixes during the tunnel', () => {
    const tunnelFixes = track.filter((f) => {
      const t = (f.timestamp - T0) / 1000;
      return t > 120 && t <= arrivalSec;
    });
    expect(tunnelFixes).toHaveLength(0);
  });

  it('fires before arrival, on dead reckoning alone', () => {
    const { firedAt, firedReason } = replay();
    expect(firedAt).not.toBeNull();
    expect(firedReason).toBe('ETA_DEAD_RECKONED');
    expect(firedAt!).toBeLessThan(arrivalSec);
  });

  it('errs early rather than late, but not absurdly early', () => {
    const { firedAt } = replay();
    const secondsOfWarning = arrivalSec - firedAt!;
    // At least the configured lead time...
    expect(secondsOfWarning).toBeGreaterThanOrEqual(
      DEFAULT_SETTINGS.leadTimeSec,
    );
    // ...and at most a few minutes, so it is still a useful alarm.
    expect(secondsOfWarning).toBeLessThan(300);
  });

  it('would have cut it much finer without fail-loud', () => {
    const loud = replay();
    const quiet = replay({ ...DEFAULT_SETTINGS, failLoud: false });
    expect(loud.firedAt!).toBeLessThan(quiet.firedAt!);
    expect(quiet.firedAt!).toBeLessThan(arrivalSec);
  });

  it('reports DARK confidence to the UI throughout the tunnel', () => {
    let trip = makeTrip({ armedAt: T0, distanceAtArmM: distanceM(track[0], DEST) });
    for (const f of track) trip = applyFix(trip, f);

    // t = 400 s: 280 s since the last fix at t = 115 s.
    const p = project(trip, T0 + 400_000);
    expect(p.confidence).toBe('DARK');
    expect(p.fixAgeSec).toBeGreaterThan(180);
    expect(p.distanceM!).toBeLessThan(distanceM(track[0], DEST));
  });
});
