/**
 * Persistence for the armed trip.
 *
 * This is deliberately the *only* channel between the UI and the background
 * task. When iOS relaunches us headlessly for a geofence event, no React tree
 * mounts and no in-memory store is hydrated — the task gets a cold JS context
 * and whatever is on disk. Routing every read and write through here means the
 * headless path and the foreground path cannot drift apart.
 *
 * AsyncStorage rather than SQLite for this one record: it is a single small
 * blob read on every background wake, and the background wake budget on iOS is
 * about ten seconds. Opening a database connection to read one row is a poor
 * use of that budget. Destinations, which are only touched in the foreground,
 * do live in SQLite (see db.ts).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS, type TripSettings, type TripState } from '../core/types';

const TRIP_KEY = 'stopnap.trip.v1';
const FAILSAFE_KEY = 'stopnap.failsafe.v1';
const SETTINGS_KEY = 'stopnap.settings.v1';

/** Bookkeeping for the scheduled app-killed backstop notification. */
export interface FailsafeRecord {
  notificationId: string;
  /** Unix ms the notification is scheduled to fire. */
  fireAtMs: number;
}

export async function loadTrip(): Promise<TripState | null> {
  try {
    const raw = await AsyncStorage.getItem(TRIP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TripState;
    // A trip persisted by an older build could be missing fields the trigger
    // relies on. Rather than crash the background task — which would mean a
    // silent failure to wake someone — treat it as no trip at all.
    if (!parsed?.destination || !parsed?.settings || !Array.isArray(parsed.fixes)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function saveTrip(trip: TripState): Promise<void> {
  await AsyncStorage.setItem(TRIP_KEY, JSON.stringify(trip));
}

export async function clearTrip(): Promise<void> {
  await AsyncStorage.multiRemove([TRIP_KEY, FAILSAFE_KEY]);
}

export async function loadFailsafe(): Promise<FailsafeRecord | null> {
  try {
    const raw = await AsyncStorage.getItem(FAILSAFE_KEY);
    return raw ? (JSON.parse(raw) as FailsafeRecord) : null;
  } catch {
    return null;
  }
}

export async function saveFailsafe(record: FailsafeRecord | null): Promise<void> {
  if (!record) {
    await AsyncStorage.removeItem(FAILSAFE_KEY);
    return;
  }
  await AsyncStorage.setItem(FAILSAFE_KEY, JSON.stringify(record));
}

export async function loadSettings(): Promise<TripSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    // Merge over defaults so a settings blob written by an older build cannot
    // leave a required field undefined in the trigger's arithmetic.
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<TripSettings>) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: TripSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
