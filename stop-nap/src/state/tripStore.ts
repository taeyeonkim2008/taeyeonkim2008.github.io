/**
 * Foreground state. Mirrors what's on disk rather than owning it — `tripRepo`
 * is the source of truth, because the background task can advance the trip
 * while no React tree exists to hear about it. Every action here writes
 * through and then re-reads.
 *
 * The store also runs its own one-second tick while the app is open. That is
 * redundant with the background task by design: when the app is foregrounded
 * we get faster location updates and can render a live countdown, and if the
 * background task is being throttled the foreground tick is a second chance to
 * notice we've arrived. Both paths call `fireAlarm`, which is idempotent.
 */

import * as Location from 'expo-location';
import { create } from 'zustand';

import { distanceM } from '../core/geo';
import { applyFix, decide, markFired, project } from '../core/trigger';
import type { TripProjection } from '../core/trigger';
import {
  DEFAULT_SETTINGS,
  SNOOZE_DURATION_SEC,
  SNOOZE_LIMIT,
  type Destination,
  type Fix,
  type TripSettings,
  type TripState,
} from '../core/types';
import { fireAlarm, startKeepAlive, stopAlarm, stopKeepAlive } from '../services/alarm';
import {
  disarmEverything,
  startTripTracking,
  stopTripTracking,
} from '../services/locationTask';
import { cancelFailsafe, scheduleFailsafe } from '../services/notifications';
import {
  getPermissionState,
  type PermissionState,
} from '../services/permissions';
import { saveDestination, touchDestination } from './db';
import { loadSettings, loadTrip, saveSettings, saveTrip } from './tripRepo';

interface TripStore {
  trip: TripState | null;
  projection: TripProjection | null;
  settings: TripSettings;
  permissions: PermissionState | null;
  hydrated: boolean;
  /** Rolling log of trigger decisions, newest first. Dev screen only. */
  decisionLog: string[];

  hydrate: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
  updateSettings: (patch: Partial<TripSettings>) => Promise<void>;

  arm: (destination: Destination) => Promise<void>;
  disarm: () => Promise<void>;
  ingestFix: (fix: Fix) => Promise<void>;
  tick: () => Promise<void>;

  triggerManualAlarm: () => Promise<void>;
  dismissAlarm: () => Promise<void>;
  snoozeAlarm: () => Promise<void>;
}

const MAX_LOG = 60;

export const useTripStore = create<TripStore>((set, get) => ({
  trip: null,
  projection: null,
  settings: { ...DEFAULT_SETTINGS },
  permissions: null,
  hydrated: false,
  decisionLog: [],

  hydrate: async () => {
    const [trip, settings, permissions] = await Promise.all([
      loadTrip(),
      loadSettings(),
      getPermissionState(),
    ]);
    set({
      trip,
      settings,
      permissions,
      hydrated: true,
      projection: trip ? project(trip, Date.now()) : null,
    });

    // The app may have been reopened *because* the alarm fired while we were
    // dead. Resume the audible alarm rather than showing a silent red screen.
    if (trip?.phase === 'ALARMING') {
      await fireAlarm(trip.destination.label, trip.firedReason ?? 'ETA_LIVE');
    } else if (trip?.phase === 'ARMED') {
      await startKeepAlive().catch(() => {});
    }
  },

  refreshPermissions: async () => {
    set({ permissions: await getPermissionState() });
  },

  updateSettings: async (patch) => {
    const settings = { ...get().settings, ...patch };
    set({ settings });
    await saveSettings(settings);
  },

  arm: async (destination) => {
    const { settings } = get();

    // Last-known first so arming is instant; a real fix refines it moments
    // later through the normal update path. Waiting for a cold GPS lock here
    // would blow the ten-second cold-launch-to-armed target.
    const known = await Location.getLastKnownPositionAsync().catch(() => null);
    const initialFixes: Fix[] = known
      ? [
          {
            latitude: known.coords.latitude,
            longitude: known.coords.longitude,
            timestamp: known.timestamp,
            accuracy: known.coords.accuracy ?? 9999,
          },
        ]
      : [];

    const distanceAtArmM = known
      ? distanceM(
          { latitude: known.coords.latitude, longitude: known.coords.longitude },
          destination,
        )
      : settings.coarseTierRadiusM;

    const trip: TripState = {
      phase: 'ARMED',
      destination,
      settings,
      armedAt: Date.now(),
      distanceAtArmM,
      fixes: initialFixes,
      innerGeofenceEntered: false,
      minDistanceSeenM: initialFixes.length ? distanceAtArmM : null,
      hasFired: false,
      powerTier: distanceAtArmM <= settings.fineTierRadiusM ? 'FINE' : 'COARSE',
      snoozeCount: 0,
      snoozeUntil: null,
    };

    await saveTrip(trip);
    set({ trip, projection: project(trip, Date.now()) });

    await saveDestination({ ...destination, lastUsedAt: Date.now() });
    await touchDestination(destination.id).catch(() => {});

    // Tracking and keep-alive are started after the state is persisted, so a
    // crash between the two leaves a recoverable trip rather than orphaned
    // background tasks.
    await startTripTracking(trip).catch(() => {});
    await startKeepAlive().catch(() => {});

    const etaSec = project(trip, Date.now()).etaSec;
    if (etaSec != null && Number.isFinite(etaSec)) {
      await scheduleFailsafe(
        destination.label,
        Date.now() + Math.max(0, etaSec - settings.leadTimeSec) * 1000,
      ).catch(() => {});
    }
  },

  disarm: async () => {
    await stopAlarm();
    stopKeepAlive();
    await disarmEverything().catch(() => {});
    set({ trip: null, projection: null, decisionLog: [] });
  },

  ingestFix: async (fix) => {
    const current = get().trip;
    if (!current || current.phase !== 'ARMED') return;
    const trip = applyFix(current, fix);
    await saveTrip(trip);
    set({ trip, projection: project(trip, Date.now()) });
  },

  tick: async () => {
    const state = get();
    const trip = state.trip;
    if (!trip) return;

    const now = Date.now();

    // Snooze expiry. Deliberately handled here rather than in `decide()`:
    // snoozing is a UI concept, and the trigger should stay a pure function of
    // position and time.
    if (trip.phase === 'SNOOZED' && trip.snoozeUntil && now >= trip.snoozeUntil) {
      const resumed: TripState = { ...trip, phase: 'ALARMING', snoozeUntil: null };
      await saveTrip(resumed);
      set({ trip: resumed });
      await fireAlarm(trip.destination.label, trip.firedReason ?? 'ETA_LIVE');
      return;
    }

    if (trip.phase !== 'ARMED') return;

    const decision = decide(trip, now);
    const logLine = `${new Date(now).toLocaleTimeString()} ${decision.action} ${decision.detail}`;

    set({
      projection: project(trip, now),
      decisionLog: [logLine, ...state.decisionLog].slice(0, MAX_LOG),
    });

    if (decision.action === 'FIRE') {
      const fired: TripState = {
        ...markFired(trip),
        firedReason: decision.reason,
      };
      await saveTrip(fired);
      set({ trip: fired });
      await cancelFailsafe();
      await fireAlarm(trip.destination.label, decision.reason ?? 'ETA_LIVE');
    }
  },

  triggerManualAlarm: async () => {
    const trip = get().trip;
    const label = trip?.destination.label ?? 'Test';
    if (trip) {
      const fired: TripState = { ...markFired(trip), firedReason: 'MANUAL' };
      await saveTrip(fired);
      set({ trip: fired });
    }
    await fireAlarm(label, 'MANUAL');
  },

  dismissAlarm: async () => {
    await stopAlarm();
    stopKeepAlive();
    await stopTripTracking().catch(() => {});
    await cancelFailsafe().catch(() => {});

    const trip = get().trip;
    if (trip) {
      const dismissed: TripState = { ...trip, phase: 'DISMISSED' };
      await saveTrip(dismissed);
      set({ trip: dismissed });
    }
  },

  snoozeAlarm: async () => {
    const trip = get().trip;
    if (!trip) return;
    if ((trip.snoozeCount ?? 0) >= SNOOZE_LIMIT) return;

    await stopAlarm();
    const snoozed: TripState = {
      ...trip,
      phase: 'SNOOZED',
      snoozeUntil: Date.now() + SNOOZE_DURATION_SEC * 1000,
      snoozeCount: (trip.snoozeCount ?? 0) + 1,
    };
    await saveTrip(snoozed);
    set({ trip: snoozed });
  },
}));
