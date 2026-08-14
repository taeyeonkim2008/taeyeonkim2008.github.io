/**
 * Notification plumbing: the alarm's presentation layer, and the app-killed
 * backstop.
 *
 * Two distinct jobs live here and it is worth keeping them straight:
 *
 * 1. `presentAlarmNotification` fires *now*, alongside the audio, so the alarm
 *    has a lock-screen presence the user can tap to reach the dismissal UI.
 *
 * 2. `scheduleFailsafe` schedules a notification for the *predicted* arrival
 *    time. It is the only part of this app that survives the user force-killing
 *    it on Android, because the OS holds the schedule, not us. It is a
 *    time-based guess rather than a location trigger — strictly worse than the
 *    real thing — but it costs nothing and it is the difference between a
 *    degraded alarm and no alarm at all.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { FireReason } from '../core/types';
import { loadFailsafe, saveFailsafe } from '../state/tripRepo';

export const ALARM_CHANNEL_ID = 'stopnap-alarm';
export const ALARM_CATEGORY_ID = 'stopnap-alarm-actions';

/**
 * Rescheduling on every single fix would thrash the notification centre, so we
 * only move the backstop when the prediction has shifted by more than this.
 */
const RESCHEDULE_THRESHOLD_MS = 30_000;

/** Never schedule the backstop closer than this — it would fire mid-arm. */
const MIN_FAILSAFE_LEAD_MS = 10_000;

let handlerInstalled = false;

export function installNotificationHandler(): void {
  if (handlerInstalled) return;
  handlerInstalled = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      // The looping alarm audio is our sound. Letting the notification play
      // its own one-shot on top just muddies it.
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function setupChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
    name: 'Stop alarms',
    importance: Notifications.AndroidImportance.MAX,
    // Escalating pattern: starts insistent and stays there.
    vibrationPattern: [0, 600, 300, 600, 300, 1000, 400, 1000],
    enableVibrate: true,
    bypassDnd: true,
    lockscreenVisibility:
      Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: 'alarm.wav',
    showBadge: false,
  });

  // A separate low-importance channel for the persistent "armed" notice, so
  // the ongoing foreground-service notice never buzzes.
  await Notifications.setNotificationChannelAsync('stopnap-status', {
    name: 'Trip status',
    importance: Notifications.AndroidImportance.LOW,
    enableVibrate: false,
    showBadge: false,
  });
}

/**
 * Registers the notification actions. The dismiss action deliberately does
 * *not* appear here — dismissal must go through the two-target gesture in the
 * app, and a notification button would be a one-tap bypass of exactly the
 * safeguard we built.
 */
export async function setupCategories(): Promise<void> {
  await Notifications.setNotificationCategoryAsync(ALARM_CATEGORY_ID, [
    {
      identifier: 'open',
      buttonTitle: 'Open to dismiss',
      options: { opensAppToForeground: true },
    },
  ]);
}

const REASON_TEXT: Record<FireReason, string> = {
  GEOFENCE_INNER: 'You are arriving now.',
  ETA_LIVE: 'You are arriving now.',
  ETA_DEAD_RECKONED: 'Arriving now (estimated — no GPS underground).',
  OVERSHOOT: 'You have passed your stop. Get off at the next one.',
  LOST_SIGNAL_FAILSAFE: 'Signal lost for a while — waking you to be safe.',
  MANUAL: 'Test alarm.',
};

export async function presentAlarmNotification(
  destinationLabel: string,
  reason: FireReason,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: `Wake up — ${destinationLabel}`,
      body: REASON_TEXT[reason],
      categoryIdentifier: ALARM_CATEGORY_ID,
      // 'critical' would bypass the ringer switch and Focus, but requires an
      // Apple entitlement most apps are refused. 'timeSensitive' is what we
      // can actually ship: it breaks through Focus modes but not the mute
      // switch. Our audio session is what handles the mute switch.
      interruptionLevel: 'timeSensitive',
      sticky: true,
      autoDismiss: false,
      vibrate: [0, 600, 300, 600, 300, 1000, 400, 1000],
      data: { kind: 'alarm', reason },
      ...(Platform.OS === 'android' ? { channelId: ALARM_CHANNEL_ID } : {}),
    },
    trigger: null, // immediate
  });
}

/**
 * Moves the app-killed backstop to `fireAtMs`, if that is meaningfully
 * different from where it already sits. Returns true if it rescheduled.
 */
export async function scheduleFailsafe(
  destinationLabel: string,
  fireAtMs: number,
): Promise<boolean> {
  const now = Date.now();
  const target = Math.max(fireAtMs, now + MIN_FAILSAFE_LEAD_MS);

  const existing = await loadFailsafe();
  if (existing && Math.abs(existing.fireAtMs - target) < RESCHEDULE_THRESHOLD_MS) {
    return false;
  }

  if (existing) {
    await Notifications.cancelScheduledNotificationAsync(
      existing.notificationId,
    ).catch(() => {});
  }

  const seconds = Math.max(1, Math.round((target - now) / 1000));
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Wake up — ${destinationLabel}`,
      body: 'Estimated arrival. Stop Nap could not confirm with GPS.',
      categoryIdentifier: ALARM_CATEGORY_ID,
      interruptionLevel: 'timeSensitive',
      sticky: true,
      autoDismiss: false,
      vibrate: [0, 600, 300, 600, 300, 1000, 400, 1000],
      data: { kind: 'failsafe' },
      ...(Platform.OS === 'android' ? { channelId: ALARM_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    },
  });

  await saveFailsafe({ notificationId, fireAtMs: target });
  return true;
}

export async function cancelFailsafe(): Promise<void> {
  const existing = await loadFailsafe();
  if (existing) {
    await Notifications.cancelScheduledNotificationAsync(
      existing.notificationId,
    ).catch(() => {});
  }
  await saveFailsafe(null);
}

export async function dismissAllAlarmNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync().catch(() => {});
}

// Deliberately not implemented: a `canUseFullScreenIntent()` wrapper.
// expo-notifications exposes no binding for Android's
// NotificationManager#canUseFullScreenIntent(), and the closest available
// signal — whether notification permission is granted — is not the same thing.
// A function that looked like it answered the question but actually answered a
// different one would be worse than its absence. Checking this properly needs
// a native module; see the README's Android full-screen-intent section.
