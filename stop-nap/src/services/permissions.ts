/**
 * Permission acquisition, and honest reporting of what we got.
 *
 * The subtle case is iOS "Allow Once". Apple gives no API to distinguish it
 * from "Allow While Using the App", and — per Expo's own documentation — if
 * the user picked it, a subsequent background-permission request *silently
 * fails with no prompt at all*. So we cannot detect it, and we cannot recover
 * from it by asking again. All we can do is notice that we asked for Always
 * and did not get it, and route the user to Settings rather than re-prompting
 * into a void.
 *
 * The other rule worth stating: we never pretend a degraded grant is fine.
 * With only while-in-use permission the app still works, but the armed screen
 * says plainly that it will not fire once the phone is locked.
 */

import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

export type PermissionLevel = 'none' | 'whenInUse' | 'always';

export interface PermissionState {
  level: PermissionLevel;
  notifications: boolean;
  servicesEnabled: boolean;
  /** True when we can still usefully prompt; false means Settings is the only path. */
  canAskAgain: boolean;
  /**
   * True when the app will work but not while backgrounded or locked. The UI
   * must surface this rather than quietly degrading.
   */
  degraded: boolean;
}

export async function getPermissionState(): Promise<PermissionState> {
  const [fg, bg, notif, servicesEnabled] = await Promise.all([
    Location.getForegroundPermissionsAsync(),
    Location.getBackgroundPermissionsAsync().catch(() => ({
      granted: false,
      canAskAgain: false,
    })),
    Notifications.getPermissionsAsync().catch(() => ({
      granted: false,
      canAskAgain: false,
    })),
    Location.hasServicesEnabledAsync().catch(() => false),
  ]);

  const level: PermissionLevel = !fg.granted
    ? 'none'
    : bg.granted
      ? 'always'
      : 'whenInUse';

  return {
    level,
    notifications: notif.granted,
    servicesEnabled,
    canAskAgain: fg.canAskAgain || (bg as { canAskAgain?: boolean }).canAskAgain === true,
    degraded: level !== 'always',
  };
}

/**
 * Foreground first — iOS rejects a background request that has not been
 * preceded by a granted foreground one, and Android 11+ requires the same
 * ordering before it will even show the Always option.
 */
export async function requestForegroundLocation(): Promise<boolean> {
  const { granted } = await Location.requestForegroundPermissionsAsync();
  return granted;
}

/**
 * Ask for Always. On Android 11+ this opens system Settings rather than a
 * dialog, which is why the onboarding screen explains what the user is about
 * to see *before* this is called.
 */
export async function requestBackgroundLocation(): Promise<boolean> {
  try {
    const { granted } = await Location.requestBackgroundPermissionsAsync();
    return granted;
  } catch {
    return false;
  }
}

export async function requestNotifications(): Promise<boolean> {
  const { granted } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
      // Requires an Apple entitlement we do not assume we have. Asking without
      // it is harmless — the flag is simply ignored — and it means the app
      // works correctly the day the entitlement is granted.
      allowCriticalAlerts: true,
      provideAppNotificationSettings: true,
    },
  });
  return granted;
}

/** Runs the full ladder in the order the platforms require. */
export async function requestAll(): Promise<PermissionState> {
  await requestNotifications();

  const fg = await requestForegroundLocation();
  if (fg) {
    await requestBackgroundLocation();
  }

  return getPermissionState();
}

export function openSystemSettings(): void {
  Linking.openSettings().catch(() => {});
}

/**
 * What the user should be told, given what we actually hold. Kept here rather
 * than in the screens so the wording stays consistent everywhere it appears.
 */
export function describeLimitation(state: PermissionState): string | null {
  if (!state.servicesEnabled) {
    return 'Location services are turned off for this device. Stop Nap cannot track your trip at all.';
  }
  if (state.level === 'none') {
    return 'Without location access Stop Nap cannot tell when you are near your stop.';
  }
  if (state.level === 'whenInUse') {
    return Platform.OS === 'ios'
      ? 'Stop Nap only has "While Using the App" access. The alarm will not fire once you lock your phone or switch apps. Grant "Always" in Settings to sleep safely.'
      : 'Stop Nap only has foreground location access. The alarm will not fire reliably once you leave the app. Grant "Allow all the time" in Settings.';
  }
  if (!state.notifications) {
    return 'Notifications are off, so the backup alarm cannot reach you if the app is closed.';
  }
  return null;
}
