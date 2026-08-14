/**
 * Spherical geometry helpers. Pure, no dependencies.
 *
 * We use the haversine formula on a sphere rather than a proper ellipsoidal
 * solution (Vincenty/Karney). Over the distances that matter here — the last
 * few kilometres of a commute — the error is well under a metre, which is two
 * orders of magnitude below GPS noise.
 */

import type { LatLng } from './types';

/** Mean Earth radius in metres (IUGG). */
export const EARTH_RADIUS_M = 6371008.8;

const toRad = (deg: number): number => (deg * Math.PI) / 180;
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

/** Great-circle distance in metres between two points. */
export function distanceM(a: LatLng, b: LatLng): number {
  const phi1 = toRad(a.latitude);
  const phi2 = toRad(b.latitude);
  const dPhi = toRad(b.latitude - a.latitude);
  const dLambda = toRad(b.longitude - a.longitude);

  const h =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Initial bearing in degrees (0–360, 0 = north) travelling from `a` to `b`. */
export function bearingDeg(a: LatLng, b: LatLng): number {
  const phi1 = toRad(a.latitude);
  const phi2 = toRad(b.latitude);
  const dLambda = toRad(b.longitude - a.longitude);

  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * The point reached by travelling `distance` metres from `origin` along
 * `bearing`. Used by the simulator to synthesise a track, and by the map to
 * frame the destination region.
 */
export function destinationPoint(
  origin: LatLng,
  bearing: number,
  distance: number,
): LatLng {
  const delta = distance / EARTH_RADIUS_M;
  const theta = toRad(bearing);
  const phi1 = toRad(origin.latitude);
  const lambda1 = toRad(origin.longitude);

  const sinPhi2 =
    Math.sin(phi1) * Math.cos(delta) +
    Math.cos(phi1) * Math.sin(delta) * Math.cos(theta);
  const phi2 = Math.asin(sinPhi2);

  const lambda2 =
    lambda1 +
    Math.atan2(
      Math.sin(theta) * Math.sin(delta) * Math.cos(phi1),
      Math.cos(delta) - Math.sin(phi1) * sinPhi2,
    );

  return {
    latitude: toDeg(phi2),
    // Normalise longitude into [-180, 180).
    longitude: ((toDeg(lambda2) + 540) % 360) - 180,
  };
}

/**
 * Linear interpolation between two points, used by the simulator. Not
 * great-circle-correct, but over the sub-kilometre steps it's called with the
 * difference is immaterial.
 */
export function interpolate(a: LatLng, b: LatLng, t: number): LatLng {
  return {
    latitude: a.latitude + (b.latitude - a.latitude) * t,
    longitude: a.longitude + (b.longitude - a.longitude) * t,
  };
}

/** Formats metres the way a sleepy person can parse at a glance. */
export function formatDistance(m: number | null): string {
  if (m == null || !Number.isFinite(m)) return '—';
  if (m < 950) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1000).toFixed(m < 9500 ? 1 : 0)} km`;
}

/** Formats a duration as m:ss, or "now" once it hits zero. */
export function formatEta(sec: number | null): string {
  if (sec == null || !Number.isFinite(sec)) return '—';
  if (sec <= 0) return 'now';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
