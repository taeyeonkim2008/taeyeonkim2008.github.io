/**
 * Geofence ring computation.
 *
 * We register three concentric regions around the destination. Only the
 * innermost one fires the alarm; the outer two exist purely to wake the app up
 * so it can escalate its power tier before it matters.
 *
 * Platform ceilings are 20 simultaneous regions on iOS and 100 on Android, so
 * three is comfortable. The floors matter more: both platforms behave poorly
 * below roughly 100 m, and iOS additionally requires the user to cross the
 * boundary, move a minimum distance past it, and *stay* there for ~20 seconds
 * before it reports the event. That dwell requirement is exactly why the inner
 * geofence is treated as one of six possible triggers rather than the trigger.
 */

import type { Destination, TripSettings } from './types';

export type GeofenceRole = 'inner' | 'mid' | 'outer';

export interface GeofenceSpec {
  identifier: string;
  latitude: number;
  longitude: number;
  radius: number;
  role: GeofenceRole;
  notifyOnEnter: boolean;
  notifyOnExit: boolean;
}

/** Below this, platform geofencing is unreliable regardless of what we ask for. */
export const MIN_GEOFENCE_RADIUS_M = 200;
export const MAX_INNER_RADIUS_M = 3000;

export const GEOFENCE_PREFIX = 'stopnap.geofence';

/** Parses a geofence identifier back into its role. */
export function roleFromIdentifier(identifier: string): GeofenceRole | null {
  const suffix = identifier.split('.').pop();
  if (suffix === 'inner' || suffix === 'mid' || suffix === 'outer') return suffix;
  return null;
}

/**
 * The distance at which the alarm should fire, given how fast we think the
 * user is moving. This is the radius of the inner geofence.
 */
export function leadDistanceM(speedMps: number, settings: TripSettings): number {
  const raw = settings.leadTimeSec * speedMps;
  return clamp(raw, MIN_GEOFENCE_RADIUS_M, MAX_INNER_RADIUS_M);
}

/**
 * Builds the three rings. `speedMps` should be the *typical* estimate, not the
 * optimistic one — the optimistic bound belongs in the ETA test, and using it
 * here would inflate the rings so far that the outer one covers the whole trip.
 */
export function computeGeofences(
  destination: Destination,
  speedMps: number,
  settings: TripSettings,
): GeofenceSpec[] {
  const inner = leadDistanceM(speedMps, settings);
  const mid = clamp(inner * 2, MIN_GEOFENCE_RADIUS_M * 2, 5000);
  const outer = clamp(inner * 4, MIN_GEOFENCE_RADIUS_M * 4, 10000);

  const base = {
    latitude: destination.latitude,
    longitude: destination.longitude,
    notifyOnEnter: true,
  };

  return [
    {
      ...base,
      identifier: `${GEOFENCE_PREFIX}.inner`,
      radius: inner,
      role: 'inner' as const,
      // Exit on the inner ring is our geofence-side overshoot signal.
      notifyOnExit: true,
    },
    {
      ...base,
      identifier: `${GEOFENCE_PREFIX}.mid`,
      radius: mid,
      role: 'mid' as const,
      notifyOnExit: false,
    },
    {
      ...base,
      identifier: `${GEOFENCE_PREFIX}.outer`,
      radius: outer,
      role: 'outer' as const,
      notifyOnExit: false,
    },
  ];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
