/**
 * The trigger state machine. This is the heart of the app and the only part
 * that decides whether a sleeping person gets woken up.
 *
 * It is deliberately pure: `decide()` takes a snapshot of trip state plus the
 * current time and returns a decision. No timers, no I/O, no platform calls.
 * That is what makes it possible to replay an entire simulated subway journey
 * — tunnel included — in a unit test in under a millisecond.
 *
 * ## The governing principle
 *
 * We never compute "the" ETA and compare it to the lead time. We compute the
 * *earliest plausible arrival* and compare that. Concretely:
 *
 *   distLower = lastKnownDistance
 *             − speedUpper × fixAge      (assume max progress since the fix)
 *             − fixAccuracy              (assume the fix flattered us)
 *             − stalenessMargin          (assume our dead reckoning is optimistic)
 *
 *   etaEarliest = max(0, distLower) / speedUpper
 *
 * Every term is signed so that *more uncertainty produces a sooner alarm*.
 * A fix that goes stale doesn't pause the countdown, it accelerates it. There
 * is no branch in this file where degraded information leads to silence — the
 * worst case is a false positive, and a commuter woken one stop early is a far
 * better outcome than one carried to the end of the line.
 */

import { distanceM } from './geo';
import { leadDistanceM } from './geofences';
import { selectTier } from './power';
import { estimateSpeed, fixAgeSec, scoreConfidence } from './speed';
import type {
  Confidence,
  Decision,
  Fix,
  FireReason,
  TripState,
} from './types';

/** Cap on the fix ring buffer. ~2 hours at COARSE, well past what we analyse. */
export const MAX_FIXES = 120;

/**
 * Metres of measured recession past the closest approach before we call it an
 * overshoot. Comfortably above GPS jitter at a stationary platform.
 */
export const OVERSHOOT_THRESHOLD_M = 150;

/**
 * Extra dead-reckoning pessimism when `failLoud` is on: we assume our estimate
 * of how far the user travelled during the blackout could be 25% short.
 */
const STALENESS_MARGIN_FRACTION = 0.25;

/** Floor on how long the signal must be dark before the failsafe fires. */
const FAILSAFE_MIN_DARK_SEC = 360;

/**
 * There is deliberately no separate wall-clock deadline condition.
 *
 * An earlier draft had one — fire once `distanceAtArm / 3 m/s` has elapsed — but
 * it turns out to be unreachable, and unreachable code in a safety path is
 * worse than none because it invites false confidence. The dead-reckoned ETA
 * always fires first: it counts down at `speedUpper`, which the clamp in
 * speed.ts pins at 3 m/s or above, and the staleness margin multiplies that by
 * a further 1.25. So the DR countdown consumes the remaining distance at
 * >= 3.75 m/s against the deadline's 3 m/s and necessarily wins.
 *
 * The case a wall-clock deadline was meant to catch — the location subsystem
 * dying outright and delivering nothing — is already covered, because with an
 * empty fix buffer the anchor falls back to the arm point and the countdown
 * runs from there on the default speed. See the "no fixes ever arrive" test.
 */

/** Lets the armed screen finish rendering before the alarm can seize the UI. */
export const ARM_GRACE_MS = 3000;

/**
 * The anchor is the most recent thing we actually know about the user's
 * position. Usually that's the newest fix; before any fix arrives it's the
 * arm point, which lets the rest of the machine treat "no GPS since launch"
 * and "no GPS since the tunnel" as the same case.
 */
interface Anchor {
  distance: number;
  timestamp: number;
  accuracy: number;
}

function anchorFor(trip: TripState): Anchor {
  const fix = trip.fixes[0];
  if (!fix) {
    return {
      distance: trip.distanceAtArmM,
      timestamp: trip.armedAt,
      accuracy: 0,
    };
  }
  return {
    distance: distanceM(fix, trip.destination),
    timestamp: fix.timestamp,
    accuracy: Number.isFinite(fix.accuracy) ? Math.max(0, fix.accuracy) : 0,
  };
}

export function decide(trip: TripState, now: number): Decision {
  const { settings } = trip;
  const speed = estimateSpeed(trip.fixes, settings);
  const confidence = scoreConfidence(trip.fixes, trip.powerTier, now);
  const anchor = anchorFor(trip);
  const ageSec = Math.max(0, (now - anchor.timestamp) / 1000);

  // --- Position projection -------------------------------------------------

  // Best guess, for display. Uses the typical speed, so it reads honestly.
  const distEstimate = Math.max(0, anchor.distance - speed.typical * ageSec);

  // Optimistic bound, for the fire test. Uses the upper speed and subtracts
  // every error term we know about.
  const stalenessMargin = settings.failLoud
    ? speed.upper * ageSec * STALENESS_MARGIN_FRACTION
    : 0;
  const distLower = Math.max(
    0,
    anchor.distance - speed.upper * ageSec - anchor.accuracy - stalenessMargin,
  );

  const etaEarliestSec = distLower / speed.upper;
  const etaSec =
    speed.typical >= 0.5 ? distEstimate / speed.typical : null;

  const nextTier = selectTier(distEstimate, trip.powerTier, settings);

  const hold = (detail: string): Decision => ({
    action: 'HOLD',
    etaSec,
    etaEarliestSec,
    distanceM: distEstimate,
    confidence,
    nextTier,
    detail,
  });

  const fire = (reason: FireReason, detail: string): Decision => ({
    action: 'FIRE',
    reason,
    etaSec,
    etaEarliestSec,
    distanceM: distEstimate,
    confidence,
    nextTier,
    detail,
  });

  // --- Guards --------------------------------------------------------------

  if (trip.phase !== 'ARMED') {
    return hold(`phase is ${trip.phase}; trigger inactive`);
  }
  if (trip.hasFired) {
    return hold('alarm already fired this trip');
  }
  if (now - trip.armedAt < ARM_GRACE_MS) {
    return hold('within arm grace window');
  }

  // --- Fire conditions, in priority order ----------------------------------

  // 1. Ground truth: the OS told us we crossed the inner boundary.
  if (trip.innerGeofenceEntered) {
    return fire(
      'GEOFENCE_INNER',
      `inner geofence entered (${Math.round(distEstimate)} m out)`,
    );
  }

  // 2. We've gone past it. Nothing else matters — fire now.
  //    Only meaningful against measured positions; dead-reckoned distance
  //    monotonically decreases and could never show recession.
  if (
    confidence !== 'DARK' &&
    trip.minDistanceSeenM != null &&
    trip.minDistanceSeenM <= leadDistanceM(speed.typical, settings) * 2 &&
    anchor.distance - trip.minDistanceSeenM >= OVERSHOOT_THRESHOLD_M
  ) {
    return fire(
      'OVERSHOOT',
      `moving away from stop (closest was ${Math.round(
        trip.minDistanceSeenM,
      )} m, now ${Math.round(anchor.distance)} m)`,
    );
  }

  // 3. The main countdown. Same test whether or not we can see satellites —
  //    only the size of the error terms differs.
  if (etaEarliestSec <= settings.leadTimeSec) {
    const reason: FireReason =
      confidence === 'DARK' ? 'ETA_DEAD_RECKONED' : 'ETA_LIVE';
    return fire(
      reason,
      confidence === 'DARK'
        ? `dead-reckoned arrival in ${Math.round(
            etaEarliestSec,
          )}s (no fix for ${Math.round(ageSec)}s)`
        : `arrival in ${Math.round(etaEarliestSec)}s at ${speed.upper.toFixed(
            1,
          )} m/s`,
    );
  }

  // 4. Signal has been dark a long time and we were plausibly close when it
  //    went. Fire even though the countdown says otherwise: an alarm we can
  //    explain beats a silence we can't.
  const darkThreshold = Math.max(
    FAILSAFE_MIN_DARK_SEC,
    settings.leadTimeSec * 4,
  );
  if (
    settings.failLoud &&
    confidence === 'DARK' &&
    anchor.distance <= settings.failsafeRadiusM &&
    ageSec >= darkThreshold
  ) {
    return fire(
      'LOST_SIGNAL_FAILSAFE',
      `no fix for ${Math.round(ageSec / 60)} min while ${Math.round(
        anchor.distance,
      )} m out`,
    );
  }

  return hold(
    `${Math.round(distEstimate)} m out, earliest arrival ${Math.round(
      etaEarliestSec,
    )}s, confidence ${confidence}`,
  );
}

// --- Pure reducers -----------------------------------------------------------

/**
 * Folds a new fix into the trip. Out-of-order fixes are inserted rather than
 * dropped — background delivery batches updates and does not guarantee order.
 */
export function applyFix(trip: TripState, fix: Fix): TripState {
  const fixes = [fix, ...trip.fixes]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, MAX_FIXES);

  const d = distanceM(fix, trip.destination);
  const minDistanceSeenM =
    trip.minDistanceSeenM == null ? d : Math.min(trip.minDistanceSeenM, d);

  return { ...trip, fixes, minDistanceSeenM };
}

export function applyGeofenceEnter(trip: TripState, role: string): TripState {
  if (role !== 'inner') return trip;
  return { ...trip, innerGeofenceEntered: true };
}

/**
 * Records the tier the location subsystem actually moved to. Kept separate
 * from `decide()` so the caller can apply it only after the platform call
 * succeeds.
 */
export function applyTier(trip: TripState, tier: TripState['powerTier']): TripState {
  return { ...trip, powerTier: tier };
}

export function markFired(trip: TripState): TripState {
  return { ...trip, hasFired: true, phase: 'ALARMING' };
}

/**
 * Convenience for the UI and the dev screen: everything `decide()` computed,
 * without the caller having to care whether it fired.
 */
export interface TripProjection {
  distanceM: number | null;
  etaSec: number | null;
  etaEarliestSec: number | null;
  confidence: Confidence;
  fixAgeSec: number;
  speedTypicalMps: number;
  speedUpperMps: number;
  speedSource: string;
}

export function project(trip: TripState, now: number): TripProjection {
  const d = decide(trip, now);
  const speed = estimateSpeed(trip.fixes, trip.settings);
  return {
    distanceM: d.distanceM,
    etaSec: d.etaSec,
    etaEarliestSec: d.etaEarliestSec,
    confidence: d.confidence,
    fixAgeSec: fixAgeSec(trip.fixes, now),
    speedTypicalMps: speed.typical,
    speedUpperMps: speed.upper,
    speedSource: speed.source,
  };
}
