/**
 * Android alarm-behaviour config plugin.
 *
 * expo-notifications does not expose `setFullScreenIntent`, so we cannot post a
 * true full-screen-intent notification from JS. What we *can* do without any
 * native code is make sure that when the alarm notification is tapped — or when
 * the activity is otherwise brought up — it appears over the lock screen and
 * turns the display on, and that we hold the permissions a full-screen intent
 * would need if it is ever added.
 *
 * Honest limits, restated here because they are easy to forget once this works
 * on a test device:
 *
 *  - Android 14+ grants USE_FULL_SCREEN_INTENT only to apps that present as
 *    calling or alarm apps, and the Play Store revokes it at install time for
 *    everything else. Declaring it is necessary but not sufficient.
 *  - `showWhenLocked` / `turnScreenOn` make the activity *able* to appear over
 *    the keyguard. They do not launch it. Without a full-screen intent, the
 *    user still has to tap the heads-up notification.
 *  - None of this survives the app being swiped out of the recents list.
 */

const {
  AndroidConfig,
  withAndroidManifest,
  createRunOncePlugin,
} = require('expo/config-plugins');

const PERMISSIONS = [
  // Wake the screen for the alarm.
  'android.permission.WAKE_LOCK',
  // Required for a notification to take over the screen. See caveats above.
  'android.permission.USE_FULL_SCREEN_INTENT',
  // The app-killed backstop must fire at a precise time, not whenever Doze
  // next relaxes. USE_EXACT_ALARM is the alarm-app variant that does not
  // require a runtime grant.
  'android.permission.SCHEDULE_EXACT_ALARM',
  'android.permission.USE_EXACT_ALARM',
  // Keeps the location foreground service alive.
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.FOREGROUND_SERVICE_LOCATION',
  // Lets us ask the user to exempt Stop Nap from battery optimisation, which
  // OEM power managers otherwise use to kill the foreground service.
  'android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
];

/** Attributes that let the alarm activity show over the keyguard. */
const ACTIVITY_ATTRIBUTES = {
  'android:showWhenLocked': 'true',
  'android:turnScreenOn': 'true',
  // Without this the activity is recreated on a lock/unlock cycle, which would
  // reset the two-target dismissal state mid-gesture.
  'android:configChanges':
    'keyboard|keyboardHidden|orientation|screenSize|screenLayout|uiMode',
};

const withStopNapAndroid = (config) => {
  config = AndroidConfig.Permissions.withPermissions(config, PERMISSIONS);

  return withAndroidManifest(config, (cfg) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      cfg.modResults,
    );
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(
      cfg.modResults,
    );

    Object.assign(mainActivity.$, ACTIVITY_ATTRIBUTES);

    // Let the OS restart the process if it is killed for memory pressure while
    // a trip is armed. This does nothing for an explicit swipe-kill.
    mainApplication.$['android:allowBackup'] = 'false';

    return cfg;
  });
};

module.exports = createRunOncePlugin(
  withStopNapAndroid,
  'stop-nap-android',
  '1.0.0',
);
