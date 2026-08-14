# Stop Nap

An alarm that wakes you shortly before your transit stop, so you can sleep on the
train instead of watching the window.

React Native + Expo SDK 57, TypeScript, iOS and Android. Requires a **development
build** — the background location and audio modules do not work in Expo Go.

**iOS requires Xcode 26+** (Swift 6.2). Xcode 16.x cannot build SDK 57 at all;
see [Verification status](#verification-status) for the exact reason.

```bash
npm install
npx expo prebuild            # generates ios/ and android/
npx expo run:ios             # or: npx expo run:android
npm test                     # 61 unit tests, no device needed
```

---

## The honest part first: what survives what

Everything below was determined from platform documentation and the Expo source.
Items marked **untested on device** have not been verified on real hardware in
this repo — see [Verification status](#verification-status).

| Situation | iOS | Android |
|---|---|---|
| App foregrounded | Works | Works |
| App backgrounded, screen locked | Works | Works |
| App backgrounded for hours | Works | Works unless an OEM power manager kills the foreground service |
| **App force-quit** (swiped from app switcher) | **Geofence triggers still work.** iOS relaunches location apps for region events — the documented exception to force-quit meaning dead. Wake window is ~10 s. | **Dead.** Expo's docs are explicit: "A terminated app will not automatically restart when a location or geofencing event occurs due to platform limitations." |
| App force-quit, backstop notification | Fires | **Fires** — the only thing that does |
| Phone on silent / ringer switch off | Alarm audio plays (see below) | Alarm audio plays |
| Phone in Do Not Disturb / Focus | Notification breaks through (`timeSensitive`); audio unaffected | Channel sets `bypassDnd` |
| Device rebooted mid-trip | Trip lost | Trip lost |
| iOS Low Power Mode | **Background location suspends.** The app warns but cannot override it. | n/a |

**The single most important line in this table:** on Android, swiping Stop Nap
out of the recents list stops everything. The app says so on the armed screen.
There is no workaround — it is a platform decision, not a missing feature.

### Why the alarm beats the silent switch without Apple's entitlement

Two separate mechanisms, and it matters which is doing the work:

- **Notification sound** respects the iOS ringer switch unless the app holds the
  **Critical Alerts entitlement**, which requires a [special request to
  Apple](https://developer.apple.com/contact/request/notifications-critical-alerts-entitlement/)
  and is granted sparingly — typically for medical and public-safety apps. This
  project does **not** assume it. `requestPermissionsAsync` asks for
  `allowCriticalAlerts` anyway, which is harmless when unentitled and means the
  app improves automatically if the entitlement is ever granted.
- **Audio session** configured with `playsInSilentMode: true` ignores the ringer
  switch with **no entitlement at all**. This is what actually makes the noise.

The catch: the audio path only works while our process is alive. If the app has
been killed, all that is left is the notification, which on a muted iPhone will
be silent. That gap is unsolvable without the entitlement, and it is the reason
the survival table above matters more than the feature list.

### Android full-screen intent

`expo-notifications` does not expose `setFullScreenIntent`, so we cannot post a
true full-screen-intent notification from JS. [`plugins/withStopNapAndroid.js`](plugins/withStopNapAndroid.js)
declares `USE_FULL_SCREEN_INTENT` and sets `showWhenLocked` / `turnScreenOn` on
the main activity, so the alarm UI *can* appear over the keyguard — but without
a full-screen intent the user still has to tap the heads-up notification to get
there. The loud audio and vibration fire regardless.

Also note that on Android 14+ the Play Store revokes `USE_FULL_SCREEN_INTENT` at
install time for apps that do not present as calling or alarm apps. Declaring it
is necessary, not sufficient.

---

## Architecture

```
src/core/          Pure TypeScript. No React Native, no Expo, no I/O.
  types.ts         Domain types and default settings
  geo.ts           Haversine distance, bearing, destination-point
  speed.ts         Speed estimation from the fix buffer + confidence scoring
  trigger.ts       decide() — the state machine
  power.ts         Power-tier policy and the ratchet
  geofences.ts     Geofence ring computation
  simTrack.ts      Synthetic track generation (shared by tests and dev screen)

src/services/      Platform-facing
  locationTask.ts  TaskManager.defineTask definitions + control surface
  alarm.ts         Audio session, volume ramp, haptics, keep-alive
  notifications.ts Channels, categories, the app-killed backstop
  permissions.ts   Staged permission ladder + honest degraded reporting
  sim.ts           GPS replay driver

src/state/
  tripRepo.ts      AsyncStorage — the only channel between UI and headless task
  db.ts            expo-sqlite destinations
  tripStore.ts     zustand, foreground only

src/screens/       Home, Armed, Alarm, Onboarding, Settings, Dev
```

`src/core` being platform-free is the load-bearing decision. It means the logic
that decides whether to wake a sleeping person is testable in milliseconds on
Node, and a six-minute tunnel is a function call rather than a train ride.

### The headless contract

`TaskManager.defineTask` is called at module scope in `locationTask.ts`, which is
imported from `index.ts` *before* the app component. This is not style. When iOS
relaunches the app for a geofence event, the system boots the JS bundle, looks
for the registered task, runs it, and tears the process down — no React tree ever
mounts. A task defined inside a component would not exist when the system came
looking, and the alarm would silently never fire.

For the same reason, nothing on the background path touches React state. Trip
state is read from and written to `tripRepo`, which is disk-backed, so the
headless path and the foreground path cannot drift.

---

## The trigger state machine

Three orthogonal axes rather than one flat enum:

```
phase       IDLE → ARMED → ALARMING → DISMISSED
                     ↑         ↓
                     └─── SNOOZED (one 60 s snooze, then unconditional re-fire)

powerTier   DORMANT  (>5 km)     Lowest accuracy, 3 km deferred distance. Geofences do the work.
            COARSE   (1.5–5 km)  Balanced accuracy, 20 s / 150 m deferred
            FINE     (<1.5 km)   High accuracy, no deferral

confidence  LIVE      fix age < 20 s (FINE) / 90 s (COARSE), accuracy < 100 m
            DEGRADED  fix age < 3 min, or accuracy 100–500 m
            DARK      fix age ≥ 3 min   ← the tunnel
```

`powerTier` **ratchets up only**. Relaxing requires believing a distance
estimate, and the moment that estimate is wrong — a stale fix from just before
the train entered a tunnel — we would have throttled the location subsystem at
exactly the wrong time.

### Fire on the *earliest plausible* arrival

The core idea. We never compute "the" ETA and compare it to the lead time. We
compute the soonest the user could possibly arrive:

```
distLower   = lastKnownDistance
            − speedUpper × fixAge      assume maximum progress since the fix
            − fixAccuracy              assume the fix flattered us
            − stalenessMargin          assume the dead reckoning is optimistic

etaEarliest = max(0, distLower) / speedUpper

FIRE when etaEarliest ≤ leadTime
```

Every term is signed so that **more uncertainty produces a sooner alarm**. A fix
going stale doesn't pause the countdown, it accelerates it. There is no branch
where degraded information produces silence.

Two clamps make this safe:

- `speedUpper` is floored at **3 m/s**. Without it, a user who appears stationary
  would produce an infinite ETA and the alarm would never fire.
- `speedUpper` is capped at **45 m/s**, so one wild fix cannot fire hours early.

### Fire conditions

| Reason | Condition | Primary for |
|---|---|---|
| `GEOFENCE_INNER` | OS reports entering the inner region | Buses, above-ground rail |
| `ETA_LIVE` | `etaEarliest ≤ leadTime`, confidence not DARK | Normal operation |
| `ETA_DEAD_RECKONED` | Same test, confidence DARK | **Subways** |
| `OVERSHOOT` | Measured distance grew ≥ 150 m past the closest approach | Missed stops |
| `LOST_SIGNAL_FAILSAFE` | DARK ≥ 6 min while last known within 5 km | Signal died while stopped |

**Geofencing cannot be the primary trigger underground**, because a geofence
*is* a GPS fix. The brief framed dead reckoning as the fallback; for the subway
case it is the only live mechanism, and the two are peers in this implementation
rather than primary and backup.

`OVERSHOOT` is only evaluated against measured positions. Dead-reckoned distance
decreases monotonically and could never show recession.

### There is no wall-clock deadline, deliberately

An earlier draft had a sixth condition: fire once `distanceAtArm / 3 m/s` had
elapsed. It is **unreachable**, and unreachable code in a safety path is worse
than none because it invites false confidence.

The dead-reckoned countdown always wins: it consumes the remaining distance at
`speedUpper` (≥ 3 m/s by the clamp) multiplied by a further 1.25 staleness
margin, i.e. ≥ 3.75 m/s, against the deadline's 3 m/s. It was removed rather
than shipped. The case it was meant to catch — the location subsystem dying
outright — is already covered: with an empty fix buffer the anchor falls back to
the arm point and the countdown runs from there. Covered by the
`fires even when no fix ever arrives after arming` test.

---

## Battery

No continuous high-accuracy polling. The `DORMANT` tier registers `Lowest`
accuracy with a 3 km deferred distance, which resolves from cell and wifi rather
than waking the GPS chip; the geofences do the real work. `FINE` — the only
expensive tier — is entered inside 1.5 km, which on a typical commute is the last
two to four minutes.

**Caveat on the plan:** Apple's true significant-location-change API would be a
better fit for `DORMANT`, but `expo-location` does not expose it. Only
`startLocationUpdatesAsync` and `startGeofencingAsync` are available, so the
low-accuracy stream above is the cheapest thing actually reachable from managed
Expo.

---

## Dev / simulation mode

`SIM` in the top-right of the home screen. Five scenarios, each targeting a
branch of the trigger: clear run, subway with tunnel, tunnel at 1×, missed stop,
slow bus.

**How time is compressed, and why it matters.** The obvious approach — replay a
recorded track faster than real time — is wrong, because the trigger reasons
about wall-clock fix age. Compressed timestamps would make a six-minute tunnel
look like a thirty-second one and the dead-reckoning path would never be
exercised. So instead of compressing time, the simulator **speeds up the
vehicle**: at `timeScale: 10` the train travels ten times faster, covering the
same ground in a tenth of the wall-clock time, and every timestamp handed to the
trigger is a genuine `Date.now()`.

The one thing this cannot reach is an absolute-time threshold — chiefly
`LOST_SIGNAL_FAILSAFE`, which needs six real minutes of darkness. Use the
"Tunnel (real time)" scenario, or rely on the unit test that covers it directly.

While a simulation runs, the real OS location feed is stopped so synthetic and
real fixes cannot interleave.

---

## Tests

```bash
npm test
```

61 tests, all pure, no device or simulator. The headline case is a full replay of
a 7.2 km commute at 15 m/s with GPS lost from t=120 s to arrival — the final six
minutes entirely dead-reckoned:

| | Fires at | Warning before arrival |
|---|---|---|
| Arrival | 480 s | — |
| Last GPS fix | 115 s (5475 m out) | — |
| `failLoud: true` (default) | **300 s** | **180 s** |
| `failLoud: false` | 345 s | 135 s |

With a configured lead time of 90 s, a six-minute blackout produces 180 s of
warning. That is the fail-loud principle working as intended: it errs early in
proportion to how blind it is. The test asserts both bounds — at least the
configured lead time, and under five minutes, so the alarm is still useful.

---

## Verification status

Honest accounting of what has and has not been checked:

**Verified in this repo**
- 61 unit tests pass, including the full tunnel replay
- `tsc --noEmit` clean under `strict` and `--noUnusedLocals`
- `npx expo-doctor` — 20/20 checks pass
- `expo config --type introspect` confirms the config plugin produces
  `USE_FULL_SCREEN_INTENT`, `USE_EXACT_ALARM`, `SCHEDULE_EXACT_ALARM`,
  `WAKE_LOCK`, `FOREGROUND_SERVICE_LOCATION`, and `showWhenLocked` /
  `turnScreenOn` on `.MainActivity`; iOS `UIBackgroundModes` is
  `['location', 'audio', 'fetch']`
- All Expo APIs used were checked against the installed SDK 57 type definitions,
  not from memory

**Build requirement: Xcode 26 or newer**

The iOS build was attempted on this machine and **cannot succeed on Xcode 16.2**.
Two Expo SDK 57 packages declare `// swift-tools-version: 6.2`, which ships with
Xcode 26:

```
node_modules/expo-modules-jsi/apple/Package.swift
node_modules/@expo/expo-modules-macros-plugin/apple/Package.swift
```

Xcode 16.2 provides Swift 6.0, so SwiftPM refuses with `package 'apple' is using
Swift tools version 6.2.0 but the installed version is 6.0.0` (the package is
named `apple` after its directory). There is no workaround: the macros plugin is
what compiles every Expo module's Swift, so it is not optional, and neither
`EXPO_USE_PRECOMPILED_MODULES=false` nor `RCT_USE_PREBUILT_RNCORE=0` avoids it —
both were tried and both hit the same wall.

Everything up to that point does work: `pod install` resolves all 284 pods
(every module this app needs, plus `react-native-maps`), CocoaPods needs
`LANG`/`LC_ALL` set to a UTF-8 locale on Ruby 4.x or it crashes in
`unicode_normalize`, and RN codegen must not share a directory with
`-derivedDataPath` (it writes to `ios/build/generated`).

**Not verified — needs a device**
- The app-killed cases in the survival table. These come from platform and Expo
  documentation, not from a run on hardware. The iOS force-quit relaunch in
  particular is documented behaviour that is worth confirming yourself before
  trusting it with a commute.
- Whether an audio session can be activated inside the ~10 s headless wake iOS
  grants for a region event. Reliable in practice per general community
  experience; not contractual.
- Real battery drain figures.
- Behaviour under OEM Android power managers (Xiaomi, Huawei, Oppo, Samsung).

Test the killed-app cases before relying on this on a route that matters.

---

## Known limitations

1. **Android force-kill is fatal.** Documented above. Only the scheduled
   notification survives.
2. **iOS region events can be ~20 s late** by design — the OS requires a
   boundary crossing, a minimum distance past it, and a 20 s dwell. This is why
   the geofence is one of five triggers rather than the trigger.
3. **Critical Alerts entitlement** is not held, so a force-quit app on a muted
   iPhone gets a silent banner.
4. **Search quality is mediocre.** The OS geocoder (Apple's on iOS, Android's on
   Android) is used to avoid an API key and billing account, and it handles bare
   station names poorly. Long-press the map to drop a pin as an escape hatch.
   Google Places or a bundled GTFS stop dataset would both be better.
5. **No background accelerometer.** `expo-sensors` does not deliver in the
   background, so the station-stop-counting stretch goal is not implementable as
   described. The viable substitute on iOS is a `CMPedometer` *historical* query
   on each background wake (`Location.getMotionActivityAsync` is also exposed);
   Android has no clean equivalent through Expo. Not implemented.
6. **The silent keep-alive track** is a grey area in App Store review. It is
   behind `KEEP_ALIVE_ENABLED` in `src/services/alarm.ts`.
7. **Trips do not survive a reboot.**

## Regenerating the alarm audio

`assets/audio/alarm.wav` is generated, not sampled:

```bash
node scripts/make-audio.js
```

A two-tone klaxon with odd harmonics and an 8 Hz tremolo. Alternating pitch
defeats habituation, the harmonics put energy in the 2–4 kHz band where hearing
and phone speakers are both most sensitive, and the tremolo adds roughness. It is
genuinely irritating, which is the design goal.
