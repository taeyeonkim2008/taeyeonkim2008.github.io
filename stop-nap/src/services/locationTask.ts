/**
 * Background location and geofencing.
 *
 * ## The headless contract
 *
 * `TaskManager.defineTask` runs at module scope, and this module is imported
 * from `index.ts` before anything else. That is not stylistic: when iOS
 * relaunches the app for a geofence event, the system boots the JS bundle,
 * looks for the task, runs it, and shuts down — no React tree is ever mounted.
 * If the definition were inside a component or an effect it would not exist
 * yet when the system came looking, and the alarm would silently never fire.
 *
 * For the same reason nothing in the handler path may touch React state. Trip
 * state comes from and goes back to `tripRepo`, which is disk-backed.
 *
 * ## What survives what
 *
 * See the README's survival table for the honest version. Summary: iOS
 * relaunches us for geofence events even after a force-quit; Android does not
 * relaunch for either geofences or location updates once the app is
 * terminated, which is a documented platform limitation and the reason the
 * scheduled failsafe notification exists.
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { computeGeofences, roleFromIdentifier } from '../core/geofences';
import { TIER_CONFIG } from '../core/power';
import { estimateSpeed } from '../core/speed';
import {
  applyFix,
  applyGeofenceEnter,
  applyTier as withTier,
  decide,
  markFired,
} from '../core/trigger';
import type { Fix, PowerTier, TripState } from '../core/types';
import { clearTrip, loadTrip, saveTrip } from '../state/tripRepo';
import { fireAlarm } from './alarm';
import { cancelFailsafe, scheduleFailsafe } from './notifications';

export const LOCATION_TASK = 'stopnap.location.updates';
export const GEOFENCE_TASK = 'stopnap.geofence';

const ACCURACY_MAP: Record<TIERKEY, Location.LocationAccuracy> = {
  Lowest: Location.Accuracy.Lowest,
  Balanced: Location.Accuracy.Balanced,
  High: Location.Accuracy.High,
};
type TIERKEY = 'Lowest' | 'Balanced' | 'High';

function toFix(location: Location.LocationObject): Fix {
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    timestamp: location.timestamp,
    accuracy: location.coords.accuracy ?? 9999,
    speed:
      typeof location.coords.speed === 'number' && location.coords.speed >= 0
        ? location.coords.speed
        : undefined,
  };
}

// --- Task definitions (module scope — see header) ----------------------------

TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    // A location error must never mean silence. Evaluate anyway: the trigger
    // treats "no new fix" as staleness, which pushes the alarm earlier.
    await evaluate((trip) => trip);
    return;
  }
  const { locations } = (data ?? {}) as { locations?: Location.LocationObject[] };
  if (!locations?.length) return;

  await evaluate((trip) =>
    locations.reduce((acc, loc) => applyFix(acc, toFix(loc)), trip),
  );
});

TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
  if (error) {
    await evaluate((trip) => trip);
    return;
  }
  const { eventType, region } = (data ?? {}) as {
    eventType?: Location.GeofencingEventType;
    region?: Location.LocationRegion;
  };
  if (!region?.identifier) return;

  const role = roleFromIdentifier(region.identifier);
  if (!role) return;

  if (eventType === Location.GeofencingEventType.Enter) {
    await evaluate((trip) => applyGeofenceEnter(trip, role));
  } else {
    // Exiting the inner ring means we were there and now are not. The trigger
    // reads this as an overshoot via minDistanceSeenM, so we only need to
    // re-evaluate rather than set a flag.
    await evaluate((trip) => trip);
  }
});

// --- Shared evaluation path --------------------------------------------------

/**
 * Loads the trip, applies `mutate`, runs the trigger, and acts on the result.
 * Every background entry point funnels through here so there is exactly one
 * place where the decision to wake someone is acted on.
 */
async function evaluate(mutate: (trip: TripState) => TripState): Promise<void> {
  const loaded = await loadTrip();
  if (!loaded || loaded.phase !== 'ARMED') return;

  const trip = mutate(loaded);
  const decision = decide(trip, Date.now());

  if (decision.action === 'FIRE') {
    const fired = markFired(trip);
    await saveTrip(fired);
    await cancelFailsafe();
    await fireAlarm(trip.destination.label, decision.reason ?? 'ETA_LIVE');
    return;
  }

  // Escalate the location subsystem if the trigger asked for it. Do this
  // before persisting, so a failed platform call leaves the stored tier
  // honest rather than optimistic.
  let next = trip;
  if (decision.nextTier !== trip.powerTier) {
    const applied = await restartUpdatesForTier(decision.nextTier);
    if (applied) next = withTier(trip, decision.nextTier);
  }

  await saveTrip(next);

  // Keep the app-killed backstop tracking our best current estimate.
  if (decision.etaSec != null && Number.isFinite(decision.etaSec)) {
    const fireAt =
      Date.now() +
      Math.max(0, decision.etaSec - trip.settings.leadTimeSec) * 1000;
    await scheduleFailsafe(trip.destination.label, fireAt).catch(() => {});
  }
}

/** Restarts the update stream with the options for `tier`. */
async function restartUpdatesForTier(tier: PowerTier): Promise<boolean> {
  try {
    const config = TIER_CONFIG[tier];
    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: ACCURACY_MAP[config.accuracy],
      deferredUpdatesInterval: config.deferredUpdatesInterval,
      deferredUpdatesDistance: config.deferredUpdatesDistance,
      // Letting the OS pause updates on a stationary user is exactly wrong for
      // us: a train sitting at a platform looks stationary, and we would be
      // paused when it pulled away.
      pausesUpdatesAutomatically: false,
      activityType: Location.LocationActivityType.OtherNavigation,
      showsBackgroundLocationIndicator: tier === 'FINE',
      foregroundService: {
        notificationTitle: 'Stop Nap is watching your stop',
        notificationBody: 'Tap to see distance remaining.',
        notificationColor: '#3B82F6',
        killServiceOnDestroy: false,
      },
    });
    return true;
  } catch {
    return false;
  }
}

// --- Public control surface --------------------------------------------------

export async function startTripTracking(trip: TripState): Promise<void> {
  const speed = estimateSpeed(trip.fixes, trip.settings);
  const regions = computeGeofences(trip.destination, speed.typical, trip.settings);

  await Location.startGeofencingAsync(
    GEOFENCE_TASK,
    regions.map((r) => ({
      identifier: r.identifier,
      latitude: r.latitude,
      longitude: r.longitude,
      radius: r.radius,
      notifyOnEnter: r.notifyOnEnter,
      notifyOnExit: r.notifyOnExit,
    })),
  );

  await restartUpdatesForTier(trip.powerTier);
}

export async function stopTripTracking(): Promise<void> {
  await Promise.allSettled([
    Location.hasStartedGeofencingAsync(GEOFENCE_TASK).then((started) =>
      started ? Location.stopGeofencingAsync(GEOFENCE_TASK) : undefined,
    ),
    Location.hasStartedLocationUpdatesAsync(LOCATION_TASK).then((started) =>
      started ? Location.stopLocationUpdatesAsync(LOCATION_TASK) : undefined,
    ),
  ]);
}

export async function disarmEverything(): Promise<void> {
  await stopTripTracking();
  await cancelFailsafe();
  await clearTrip();
}

/**
 * Diagnostics for the dev screen: what the OS thinks is registered right now,
 * which is the first thing worth checking when the alarm did not fire.
 */
export async function getTaskDiagnostics(): Promise<{
  geofencingStarted: boolean;
  updatesStarted: boolean;
  registeredTasks: string[];
  backgroundAvailable: boolean;
}> {
  const [geofencingStarted, updatesStarted, registered, backgroundAvailable] =
    await Promise.all([
      Location.hasStartedGeofencingAsync(GEOFENCE_TASK).catch(() => false),
      Location.hasStartedLocationUpdatesAsync(LOCATION_TASK).catch(() => false),
      TaskManager.getRegisteredTasksAsync().catch(() => []),
      Location.isBackgroundLocationAvailableAsync().catch(() => false),
    ]);

  return {
    geofencingStarted,
    updatesStarted,
    registeredTasks: registered.map((t) => t.taskName),
    backgroundAvailable,
  };
}
