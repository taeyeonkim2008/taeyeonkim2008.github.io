/**
 * Power-tier policy: how aggressively we ask the OS for location, as a pure
 * function of how far away we still are.
 *
 * The single most important rule here is the *ratchet*: a tier never steps
 * back down during a trip. Relaxing to a cheaper tier requires believing a
 * distance estimate, and the moment that estimate is wrong — say a stale fix
 * from before the train entered a tunnel — we'd have throttled the location
 * subsystem right when we most needed it. Upgrades are cheap and reversible at
 * the end of the trip; downgrades are how people sleep past their stop.
 */

import type { PowerTier, TripSettings } from './types';

const RANK: Record<PowerTier, number> = { DORMANT: 0, COARSE: 1, FINE: 2 };

export function tierRank(tier: PowerTier): number {
  return RANK[tier];
}

/**
 * A platform-independent description of what a tier wants from the OS.
 * `services/locationTask.ts` maps `accuracy` onto the expo-location enum; the
 * split keeps this module unit-testable without a device.
 */
export interface TierConfig {
  accuracy: 'Lowest' | 'Balanced' | 'High';
  /** Minimum ms between delivered updates. 0 = as fast as the OS offers. */
  deferredUpdatesInterval: number;
  /** Minimum metres of movement between delivered updates. */
  deferredUpdatesDistance: number;
  /**
   * Whether this tier keeps a continuous update stream running.
   *
   * DORMANT still registers a stream, but at `Lowest` accuracy with a 3 km
   * deferred distance, which in practice resolves from cell towers and wifi
   * rather than waking the GPS chip. Apple's true significant-location-change
   * API would be a better fit here, but expo-location does not expose it —
   * only `startLocationUpdatesAsync` and `startGeofencingAsync` — so this is
   * the cheapest thing actually reachable from managed Expo. The geofences do
   * the real work at this tier.
   */
  continuous: boolean;
}

export const TIER_CONFIG: Record<PowerTier, TierConfig> = {
  DORMANT: {
    accuracy: 'Lowest',
    deferredUpdatesInterval: 5 * 60 * 1000,
    deferredUpdatesDistance: 3000,
    continuous: false,
  },
  COARSE: {
    accuracy: 'Balanced',
    deferredUpdatesInterval: 20 * 1000,
    deferredUpdatesDistance: 150,
    continuous: true,
  },
  FINE: {
    accuracy: 'High',
    deferredUpdatesInterval: 0,
    deferredUpdatesDistance: 0,
    continuous: true,
  },
};

/** The tier the current distance argues for, ignoring the ratchet. */
export function desiredTier(
  distance: number | null,
  settings: TripSettings,
): PowerTier {
  if (distance == null || !Number.isFinite(distance)) return 'COARSE';
  if (distance <= settings.fineTierRadiusM) return 'FINE';
  if (distance <= settings.coarseTierRadiusM) return 'COARSE';
  return 'DORMANT';
}

/**
 * Applies the ratchet. Returns whichever of the current and desired tiers is
 * more aggressive.
 */
export function selectTier(
  distance: number | null,
  current: PowerTier,
  settings: TripSettings,
): PowerTier {
  const desired = desiredTier(distance, settings);
  return RANK[desired] > RANK[current] ? desired : current;
}
