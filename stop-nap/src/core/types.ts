/**
 * Core domain types. This module is pure — it imports nothing from React Native,
 * Expo, or any platform API, so every consumer of it is unit-testable on Node.
 */

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Destination extends LatLng {
  id: string;
  label: string;
  /** Free-form subtitle, e.g. the geocoded street address. */
  subtitle?: string;
  /** Unix ms. Used to order the "recents" row on the home screen. */
  lastUsedAt: number;
  useCount: number;
  isFavorite: boolean;
}

/**
 * A single position sample. `speed` is whatever the OS reported (m/s, or -1 /
 * undefined when unknown) — we never trust it alone, see speed.ts.
 */
export interface Fix extends LatLng {
  /** Unix ms. */
  timestamp: number;
  /** Horizontal accuracy in metres. Larger is worse. */
  accuracy: number;
  /** OS-reported instantaneous speed in m/s, if available. */
  speed?: number;
  /** Marks fixes produced by the simulator rather than the OS. */
  simulated?: boolean;
}

/** How much we trust our current knowledge of where the user is. */
export type Confidence = 'LIVE' | 'DEGRADED' | 'DARK';

/**
 * Location-subsystem power level. Ratchets up only — see power.ts for why
 * relaxing mid-trip is unsafe.
 */
export type PowerTier = 'DORMANT' | 'COARSE' | 'FINE';

export type TripPhase = 'IDLE' | 'ARMED' | 'ALARMING' | 'SNOOZED' | 'DISMISSED';

export type FireReason =
  /** Entered the innermost geofence. Primary trigger above ground. */
  | 'GEOFENCE_INNER'
  /** Earliest-plausible-arrival ETA hit the lead time with a trustworthy fix. */
  | 'ETA_LIVE'
  /** Same, but the countdown ran on dead reckoning. Primary trigger underground. */
  | 'ETA_DEAD_RECKONED'
  /** Distance started growing again — we've gone past the stop. */
  | 'OVERSHOOT'
  /** Signal dark too long while plausibly close. Fires rather than risk silence. */
  | 'LOST_SIGNAL_FAILSAFE'
  /** User pressed the test button. */
  | 'MANUAL';

export type DecisionAction = 'FIRE' | 'HOLD';

export interface Decision {
  action: DecisionAction;
  /** Populated whenever action === 'FIRE'. */
  reason?: FireReason;
  /** Best-guess seconds to arrival, for display. Null when unknowable. */
  etaSec: number | null;
  /**
   * The optimistic (soonest) arrival estimate the fire test actually uses.
   * Always <= etaSec. Null when unknowable.
   */
  etaEarliestSec: number | null;
  /** Best-guess metres remaining, dead-reckoned when the fix is stale. */
  distanceM: number | null;
  confidence: Confidence;
  /** Tier the caller should transition the location subsystem to. */
  nextTier: PowerTier;
  /** Human-readable explanation, surfaced in the armed UI and the dev log. */
  detail: string;
}

export interface TripSettings {
  /** Seconds of warning the user wants. Configurable 30–300 per the brief. */
  leadTimeSec: number;
  /**
   * Assumed speed (m/s) before we've observed any movement. Defaults to a
   * typical metro average including station dwell.
   */
  defaultSpeedMps: number;
  /** Below this distance we escalate to FINE. */
  fineTierRadiusM: number;
  /** Below this distance we escalate to COARSE. */
  coarseTierRadiusM: number;
  /**
   * If the signal is dark and our last known distance was inside this radius,
   * the failsafe is allowed to fire. Beyond it we assume the user is nowhere
   * near and hold.
   */
  failsafeRadiusM: number;
  /** Enables the extra-early wake-up when confidence is poor. */
  failLoud: boolean;
}

export const DEFAULT_SETTINGS: TripSettings = {
  leadTimeSec: 90,
  defaultSpeedMps: 12, // ~43 km/h, a reasonable metro average
  fineTierRadiusM: 1500,
  coarseTierRadiusM: 5000,
  failsafeRadiusM: 5000,
  failLoud: true,
};

export interface TripState {
  phase: TripPhase;
  destination: Destination;
  settings: TripSettings;
  /** Unix ms when the user armed the trip. */
  armedAt: number;
  /** Straight-line metres from the arm point to the destination. */
  distanceAtArmM: number;
  /** Newest first, capped. See speed.ts for the window we actually use. */
  fixes: Fix[];
  /** Set by the geofence task when the inner region reports an Enter event. */
  innerGeofenceEntered: boolean;
  /** Smallest distance seen so far this trip. Drives overshoot detection. */
  minDistanceSeenM: number | null;
  /** Guards against re-firing on every tick once the alarm is already up. */
  hasFired: boolean;
  /** Current power tier, so power.ts can enforce the ratchet. */
  powerTier: PowerTier;
  /** Unix ms the snooze expires, if snoozed. */
  snoozeUntil?: number | null;
  /** Snoozes used. Capped — see SNOOZE_LIMIT. */
  snoozeCount?: number;
  /** Why the alarm fired, retained so the alarm screen can explain itself. */
  firedReason?: FireReason;
}

/**
 * One snooze, then the alarm returns and cannot be snoozed again. A commuter
 * who snoozes twice is asleep, and the whole point of the app is to not let
 * that end at the depot.
 */
export const SNOOZE_LIMIT = 1;
export const SNOOZE_DURATION_SEC = 60;
