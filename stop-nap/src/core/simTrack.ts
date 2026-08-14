/**
 * Synthetic GPS track generation. Pure, so the unit tests and the on-device
 * dev screen replay exactly the same data.
 *
 * The point of this module is that "ride a train into a tunnel" becomes a
 * function call. Without it, the only way to exercise the dead-reckoning path
 * is to physically get on a subway, which is a terrible edit-test loop.
 */

import { bearingDeg, destinationPoint, distanceM } from './geo';
import type { Fix, LatLng } from './types';

export interface SimTrackOptions {
  origin: LatLng;
  destination: LatLng;
  /** Constant ground speed, m/s. */
  speedMps: number;
  /** Seconds between emitted fixes. */
  intervalSec?: number;
  /** Unix ms of the first sample. */
  startTime?: number;
  /**
   * Windows, in seconds from track start, during which no fix is emitted.
   * This is the tunnel. `[[120, 480]]` blacks out from 2:00 to 8:00.
   */
  gaps?: Array<[number, number]>;
  /** Reported horizontal accuracy in metres. */
  accuracy?: number;
  /** Metres to keep travelling past the destination, to exercise overshoot. */
  overshootM?: number;
}

/**
 * Returns fixes **oldest first**, which is the order a real device delivers
 * them. Callers pushing into `TripState.fixes` should use `applyFix`, which
 * maintains the newest-first invariant.
 */
export function buildSimTrack(opts: SimTrackOptions): Fix[] {
  const {
    origin,
    destination,
    speedMps,
    intervalSec = 5,
    startTime = Date.now(),
    gaps = [],
    accuracy = 15,
    overshootM = 0,
  } = opts;

  const totalM = distanceM(origin, destination) + overshootM;
  const bearing = bearingDeg(origin, destination);
  const totalSec = totalM / speedMps;

  const fixes: Fix[] = [];
  for (let t = 0; t <= totalSec; t += intervalSec) {
    if (gaps.some(([from, to]) => t >= from && t <= to)) continue;

    const travelled = Math.min(totalM, speedMps * t);
    const point = destinationPoint(origin, bearing, travelled);

    fixes.push({
      ...point,
      timestamp: startTime + t * 1000,
      accuracy,
      speed: speedMps,
      simulated: true,
    });
  }

  return fixes;
}

/**
 * A canned commute used by both the tests and the dev screen: eight minutes of
 * travel toward the destination with a six-minute tunnel starting two minutes
 * in, so the last stretch is entirely dead-reckoned. This is the scenario the
 * whole fallback chain exists for.
 */
export function buildTunnelCommute(
  destination: LatLng,
  startTime = Date.now(),
): { fixes: Fix[]; origin: LatLng; options: SimTrackOptions } {
  const speedMps = 15; // ~54 km/h
  // Start ~7.2 km out: 480 s of travel at 15 m/s.
  const origin = destinationPoint(
    destination,
    bearingDeg(destination, { latitude: 0, longitude: 0 }),
    speedMps * 480,
  );

  const options: SimTrackOptions = {
    origin,
    destination,
    speedMps,
    intervalSec: 5,
    startTime,
    gaps: [[120, 480]],
    accuracy: 12,
  };

  return { fixes: buildSimTrack(options), origin, options };
}
