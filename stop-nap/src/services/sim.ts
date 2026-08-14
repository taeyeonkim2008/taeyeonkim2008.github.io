/**
 * Simulated GPS replay, so the trigger chain can be exercised without riding a
 * train.
 *
 * ## How time is compressed, and why it matters
 *
 * The obvious approach — replay a recorded track faster than real time — is
 * wrong here, because the trigger reasons about *wall-clock* fix age. Feeding
 * it timestamps from a compressed clock would make a six-minute tunnel look
 * like a thirty-second one, and the dead-reckoning path would never be tested.
 *
 * So instead of compressing time we speed up the vehicle. At `timeScale` 10 the
 * simulated train travels at ten times its normal speed, covering the same
 * ground in a tenth of the wall-clock time, and every timestamp handed to the
 * trigger is a genuine `Date.now()`. The speed estimator observes the fast
 * train, dead reckoning extrapolates at the fast speed, and the arithmetic is
 * the same arithmetic that runs on a real commute.
 *
 * The one thing this cannot exercise is any absolute-time threshold — chiefly
 * `LOST_SIGNAL_FAILSAFE`, which needs six real minutes of darkness. Run at
 * `timeScale: 1` to reach it. The unit tests cover it directly.
 */

import { bearingDeg, destinationPoint, distanceM } from '../core/geo';
import type { Fix, LatLng } from '../core/types';

export interface SimOptions {
  destination: LatLng;
  /** Straight-line metres from the simulated start to the destination. */
  startDistanceM: number;
  /** Real-world ground speed of the vehicle, m/s. */
  speedMps: number;
  /**
   * Tunnel window as fractions of the journey. `[0.25, 0.9]` blacks out GPS
   * from a quarter of the way in until 90% of the way there.
   */
  tunnel?: [number, number] | null;
  /** Vehicle speed multiplier. See module docs. */
  timeScale?: number;
  /** How often to emit a fix, in real milliseconds. */
  emitIntervalMs?: number;
  /** Metres to continue past the destination, to exercise overshoot. */
  overshootM?: number;
  accuracy?: number;
}

export interface SimStatus {
  running: boolean;
  elapsedRealSec: number;
  travelledM: number;
  remainingM: number;
  inTunnel: boolean;
  fixesEmitted: number;
  fixesSuppressed: number;
}

export interface SimController {
  stop: () => void;
  status: () => SimStatus;
}

const DEFAULTS = {
  timeScale: 10,
  emitIntervalMs: 1000,
  overshootM: 0,
  accuracy: 12,
};

/**
 * Starts a replay. `onFix` receives synthetic fixes exactly as the OS would
 * deliver real ones — same shape, same real timestamps — so they can be pushed
 * straight through `tripStore.ingestFix` and down the normal path.
 */
export function startSimulation(
  options: SimOptions,
  onFix: (fix: Fix) => void,
  onEnd?: () => void,
): SimController {
  const {
    destination,
    startDistanceM,
    speedMps,
    tunnel = null,
    timeScale = DEFAULTS.timeScale,
    emitIntervalMs = DEFAULTS.emitIntervalMs,
    overshootM = DEFAULTS.overshootM,
    accuracy = DEFAULTS.accuracy,
  } = options;

  // Start due north of the destination and travel straight in.
  const origin = destinationPoint(destination, 0, startDistanceM);
  const heading = bearingDeg(origin, destination);
  const effectiveSpeed = speedMps * timeScale;
  const totalM = startDistanceM + overshootM;

  const startedAt = Date.now();
  let fixesEmitted = 0;
  let fixesSuppressed = 0;
  let travelledM = 0;
  let inTunnel = false;
  let running = true;

  const timer = setInterval(() => {
    const elapsedRealSec = (Date.now() - startedAt) / 1000;
    travelledM = Math.min(totalM, effectiveSpeed * elapsedRealSec);

    const progress = travelledM / startDistanceM;
    inTunnel = tunnel != null && progress >= tunnel[0] && progress <= tunnel[1];

    if (inTunnel) {
      fixesSuppressed++;
    } else {
      const point = destinationPoint(origin, heading, travelledM);
      onFix({
        ...point,
        timestamp: Date.now(),
        accuracy,
        // Deliberately omitted: real transit fixes frequently report -1 here,
        // and the estimator must not come to depend on it.
        simulated: true,
      });
      fixesEmitted++;
    }

    if (travelledM >= totalM) {
      stop();
      onEnd?.();
    }
  }, emitIntervalMs);

  function stop() {
    if (!running) return;
    running = false;
    clearInterval(timer);
  }

  return {
    stop,
    status: () => ({
      running,
      elapsedRealSec: (Date.now() - startedAt) / 1000,
      travelledM,
      remainingM: Math.max(0, distanceM(
        destinationPoint(origin, heading, Math.min(travelledM, startDistanceM)),
        destination,
      )),
      inTunnel,
      fixesEmitted,
      fixesSuppressed,
    }),
  };
}

/**
 * The canned scenarios offered on the dev screen. Each one targets a specific
 * branch of the trigger.
 */
export const SIM_SCENARIOS: Array<{
  id: string;
  label: string;
  description: string;
  build: (destination: LatLng) => SimOptions;
}> = [
  {
    id: 'clear',
    label: 'Clear run',
    description: '6 km with GPS throughout. Should fire on ETA or the inner geofence.',
    build: (destination) => ({
      destination,
      startDistanceM: 6000,
      speedMps: 15,
      tunnel: null,
      timeScale: 10,
    }),
  },
  {
    id: 'tunnel',
    label: 'Subway with tunnel',
    description:
      '7 km with GPS lost from 20% to 95% of the way. Must fire on dead reckoning alone.',
    build: (destination) => ({
      destination,
      startDistanceM: 7000,
      speedMps: 15,
      tunnel: [0.2, 0.95],
      timeScale: 10,
    }),
  },
  {
    id: 'tunnel-realtime',
    label: 'Tunnel (real time)',
    description:
      'Same, at 1×. Slow, but the only scenario that can reach the lost-signal failsafe.',
    build: (destination) => ({
      destination,
      startDistanceM: 7000,
      speedMps: 15,
      tunnel: [0.2, 0.95],
      timeScale: 1,
    }),
  },
  {
    id: 'overshoot',
    label: 'Missed stop',
    description:
      'Travels 2 km past the destination. Should fire on overshoot detection.',
    build: (destination) => ({
      destination,
      startDistanceM: 4000,
      speedMps: 15,
      tunnel: null,
      timeScale: 10,
      overshootM: 2000,
    }),
  },
  {
    id: 'slow-bus',
    label: 'Slow bus',
    description: '3 km at 6 m/s with GPS throughout. Tests the shorter lead distance.',
    build: (destination) => ({
      destination,
      startDistanceM: 3000,
      speedMps: 6,
      tunnel: null,
      timeScale: 10,
    }),
  },
];
