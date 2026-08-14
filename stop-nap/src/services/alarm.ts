/**
 * The alarm itself, plus the audio session that keeps us alive to play it.
 *
 * ## Why audio and not just a notification
 *
 * A notification's sound respects the iOS ringer switch unless the app holds
 * Apple's Critical Alerts entitlement, which is granted sparingly and which we
 * should not assume we have. An *audio session* configured with
 * `playsInSilentMode` does not respect the ringer switch, and needs no
 * entitlement at all. So the notification is the visual layer and the audio
 * session is what actually makes noise. The catch is that this only works
 * while our process is alive — see the README's survival table.
 *
 * ## Why we play silence while armed
 *
 * Two reasons. It holds the audio session open, so when the alarm fires there
 * is no session-activation latency at the one moment latency is unacceptable.
 * And on iOS it contributes to keeping the process resident alongside
 * background location. This is a well-worn technique among alarm apps but it
 * is a grey area in App Store review, so it sits behind `KEEP_ALIVE_ENABLED`.
 */

import * as Haptics from 'expo-haptics';
import {
  AudioPlayer,
  createAudioPlayer,
  setAudioModeAsync,
} from 'expo-audio';
import { Platform, Vibration } from 'react-native';

import type { FireReason } from '../core/types';
import {
  dismissAllAlarmNotifications,
  presentAlarmNotification,
} from './notifications';

const ALARM_SOURCE = require('../../assets/audio/alarm.wav');
const SILENCE_SOURCE = require('../../assets/audio/silence.wav');

/** Set false to ship without the silent keep-alive track. See module docs. */
export const KEEP_ALIVE_ENABLED = true;

/** Volume the ramp starts at. Audible immediately, but not a jump-scare. */
const RAMP_START_VOLUME = 0.15;
const RAMP_END_VOLUME = 1.0;
const RAMP_DURATION_MS = 20_000;
const RAMP_TICK_MS = 250;

/** Vibration cycle. Long pulses, because short buzzes read as a text message. */
const VIBRATION_PATTERN = [0, 600, 300, 600, 300, 1000, 400, 1000];
const HAPTIC_CYCLE_MS = 900;

let alarmPlayer: AudioPlayer | null = null;
let keepAlivePlayer: AudioPlayer | null = null;
let rampTimer: ReturnType<typeof setInterval> | null = null;
let hapticTimer: ReturnType<typeof setInterval> | null = null;
let alarming = false;

export function isAlarming(): boolean {
  return alarming;
}

/**
 * Must be called before any playback, and again after the app is relaunched
 * headlessly — the session does not survive process death.
 */
export async function configureAudioSession(): Promise<void> {
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    // We are an alarm. Ducking under a podcast defeats the purpose.
    interruptionMode: 'doNotMix',
    shouldRouteThroughEarpiece: false,
    allowsRecording: false,
  });
}

export async function startKeepAlive(): Promise<void> {
  if (!KEEP_ALIVE_ENABLED || keepAlivePlayer) return;
  await configureAudioSession();

  keepAlivePlayer = createAudioPlayer(SILENCE_SOURCE);
  keepAlivePlayer.loop = true;
  keepAlivePlayer.volume = 0.0;
  keepAlivePlayer.play();

  // Android tears down background playback after ~3 minutes unless the player
  // is registered for lock screen controls. Not optional for us.
  if (Platform.OS === 'android') {
    keepAlivePlayer.setActiveForLockScreen(true, {
      title: 'Stop Nap armed',
      artist: 'Waiting for your stop',
    });
  }
}

export function stopKeepAlive(): void {
  if (!keepAlivePlayer) return;
  try {
    if (Platform.OS === 'android') {
      keepAlivePlayer.setActiveForLockScreen(false);
    }
    keepAlivePlayer.pause();
    keepAlivePlayer.remove();
  } catch {
    // Player may already be torn down by the OS; nothing to recover.
  }
  keepAlivePlayer = null;
}

/**
 * Starts the alarm: notification, escalating audio, and vibration. Safe to
 * call twice — the second call is a no-op rather than a second overlapping
 * siren.
 */
export async function fireAlarm(
  destinationLabel: string,
  reason: FireReason,
): Promise<void> {
  if (alarming) return;
  alarming = true;

  // Present the notification first. If anything below throws — a torn-down
  // audio session in a headless relaunch, say — the user still gets woken.
  await presentAlarmNotification(destinationLabel, reason).catch(() => {});

  try {
    await configureAudioSession();

    stopKeepAlive();

    alarmPlayer = createAudioPlayer(ALARM_SOURCE);
    alarmPlayer.loop = true;
    alarmPlayer.volume = RAMP_START_VOLUME;
    alarmPlayer.play();

    if (Platform.OS === 'android') {
      alarmPlayer.setActiveForLockScreen(true, {
        title: `Wake up — ${destinationLabel}`,
        artist: 'Stop Nap',
      });
    }

    startRamp();
  } catch {
    // Audio failed. The notification and vibration still stand.
  }

  startVibration();
}

function startRamp(): void {
  if (rampTimer) return;
  const startedAt = Date.now();

  rampTimer = setInterval(() => {
    if (!alarmPlayer) return;
    const t = Math.min(1, (Date.now() - startedAt) / RAMP_DURATION_MS);
    // Ease-in: stays gentle briefly, then climbs hard. A linear ramp spends
    // too long in the range a sleeping person filters out.
    const eased = t * t;
    const volume = RAMP_START_VOLUME + (RAMP_END_VOLUME - RAMP_START_VOLUME) * eased;
    try {
      alarmPlayer.volume = volume;
    } catch {
      // Player removed mid-ramp.
    }
    if (t >= 1 && rampTimer) {
      clearInterval(rampTimer);
      rampTimer = null;
    }
  }, RAMP_TICK_MS);
}

function startVibration(): void {
  if (Platform.OS === 'android') {
    // Android honours a repeating pattern natively, which survives better
    // than a JS timer if the app is throttled.
    Vibration.vibrate(VIBRATION_PATTERN, true);
    return;
  }

  // iOS ignores vibration patterns, so we drive haptics on a timer instead.
  if (hapticTimer) return;
  const pulse = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
      () => {},
    );
    setTimeout(
      () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}),
      250,
    );
    setTimeout(
      () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}),
      450,
    );
  };
  pulse();
  hapticTimer = setInterval(pulse, HAPTIC_CYCLE_MS);
}

export async function stopAlarm(): Promise<void> {
  alarming = false;

  if (rampTimer) {
    clearInterval(rampTimer);
    rampTimer = null;
  }
  if (hapticTimer) {
    clearInterval(hapticTimer);
    hapticTimer = null;
  }
  Vibration.cancel();

  if (alarmPlayer) {
    try {
      if (Platform.OS === 'android') alarmPlayer.setActiveForLockScreen(false);
      alarmPlayer.pause();
      alarmPlayer.remove();
    } catch {
      // Already gone.
    }
    alarmPlayer = null;
  }

  await dismissAllAlarmNotifications();
}

/**
 * Plays the alarm briefly so the user can check it is loud enough *before*
 * they fall asleep relying on it. Used by Settings.
 */
export async function previewAlarm(durationMs = 4000): Promise<void> {
  await configureAudioSession();
  const player = createAudioPlayer(ALARM_SOURCE);
  player.loop = true;
  player.volume = 0.6;
  player.play();
  startVibration();

  setTimeout(() => {
    try {
      player.pause();
      player.remove();
    } catch {
      // Already gone.
    }
    if (hapticTimer) {
      clearInterval(hapticTimer);
      hapticTimer = null;
    }
    Vibration.cancel();
  }, durationMs);
}
