// The simulation model: realistic, smooth, deterministic occupancy curves.
//
//   ratio = baseCurve(type, local time − lag) ^ exponent × amplitude × dayFactor
//           × academic-calendar factor × opening-hours ramp
//           + smooth noise
//
// Every term is a pure function of (space, floor, time), so repeated calls for
// nearby times give nearby numbers — no jumps between refreshes, no state.

import type { FloorConfig, FloorProfile, SpaceConfig, SpaceType } from "@/lib/types";
import { campusClock, type CampusClock } from "@/lib/time";
import { openWindow } from "@/lib/hours";
import { periodOn } from "@/config/calendar";
import { hashString, randSigned, valueNoise } from "./random";

/** Gaussian bump on a 24h circle, so late-night tails wrap past midnight. */
function bump(hour: number, center: number, width: number, height: number): number {
  const d = ((hour - center + 36) % 24) - 12;
  return height * Math.exp(-0.5 * (d / width) ** 2);
}

/** Typical fullness (0–1) for a space type at a fractional local hour. */
export function baseCurve(type: SpaceType, hour: number, weekend: boolean): number {
  let v: number;
  switch (type) {
    case "study":
      v = weekend
        ? 0.03 + bump(hour, 15, 3, 0.48) + bump(hour, 20.5, 2.2, 0.32)
        : 0.04 + bump(hour, 10.5, 1.8, 0.35) + bump(hour, 14.5, 2.2, 0.7) + bump(hour, 20.5, 2.4, 0.78);
      break;
    case "gym":
      v = weekend
        ? 0.02 + bump(hour, 11.5, 2, 0.5) + bump(hour, 16, 2, 0.45)
        : 0.02 + bump(hour, 7.5, 1.1, 0.5) + bump(hour, 12.5, 1.2, 0.35) + bump(hour, 18.5, 1.6, 0.9);
      break;
    case "dining":
      v = weekend
        ? 0.01 + bump(hour, 11.5, 1.4, 0.55) + bump(hour, 18, 1.2, 0.6)
        : 0.01 +
          bump(hour, 8.3, 0.9, 0.35) +
          bump(hour, 12.5, 1.0, 0.92) +
          bump(hour, 18.5, 1.1, 0.88) +
          bump(hour, 21.5, 1.0, 0.15);
      break;
  }
  return Math.min(1, v);
}

interface ProfileShape {
  /** Hours the curve is delayed by (negative = earlier). */
  lag: number;
  amplitude: number;
  /** >1 fills slowly then catches up near peak; <1 fills quickly. */
  exponent: number;
}

export const PROFILE_SHAPES: Record<FloorProfile, ProfileShape> = {
  standard: { lag: 0, amplitude: 1, exponent: 1 },
  quiet: { lag: 0.75, amplitude: 0.95, exponent: 1.5 },
  social: { lag: -0.4, amplitude: 1, exponent: 0.85 },
  cardio: { lag: -0.5, amplitude: 1, exponent: 1 },
  weights: { lag: 0.4, amplitude: 1.05, exponent: 1 },
  courts: { lag: 1.2, amplitude: 0.85, exponent: 1.2 },
};

/** Hour (campus time) at which one "behavioural day" ends and the next begins. */
export const DAY_BOUNDARY_HOUR = 4;

/**
 * Evaluates a per-day quantity (weekend or not, holiday multiplier…) for the
 * "behavioural day" containing `at`. Friday 1 am still belongs to Thursday
 * night, so the switch happens around DAY_BOUNDARY_HOUR — blended over two
 * hours, when every space is near-empty, so there's no visible step.
 */
export function dayBlend(at: Date, hour: number, valueFor: (day: CampusClock) => number): number {
  const dayAt = (offsetHours: number) => valueFor(campusClock(new Date(at.getTime() - offsetHours * 3_600_000)));
  const before = dayAt(DAY_BOUNDARY_HOUR + 1);
  const after = dayAt(DAY_BOUNDARY_HOUR - 1);
  if (before === after) return after;
  const f = Math.min(1, Math.max(0, (hour - (DAY_BOUNDARY_HOUR - 1)) / 2));
  return before + (after - before) * f * f * (3 - 2 * f);
}

/** Academic-calendar multiplier (breaks, finals…) for a space type. */
export function calendarFactor(type: SpaceType, day: CampusClock): number {
  return periodOn(day.dateKey)?.factor[type] ?? 1;
}

const smoothstep = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** Minutes over which a space fills after opening / empties before closing. */
export const OPENING_RAMP_MIN = 45;
export const CLOSING_RAMP_MIN = 30;

/** 0 when closed; eases in after opening and out before closing. */
export function openFactor(space: SpaceConfig, at: Date): number {
  const w = openWindow(space, at);
  if (!w.open) return 0;
  return smoothstep(w.minutesSinceOpen / OPENING_RAMP_MIN) * smoothstep(w.minutesUntilClose / CLOSING_RAMP_MIN);
}

/** Hard ceiling so floors never read as more than ~full. */
export const MAX_RATIO = 0.98;

/**
 * Simulated fullness (0–MAX_RATIO) of one floor at one instant.
 */
export function simulateFloorRatio(space: SpaceConfig, floor: FloorConfig, at: Date): number {
  const key = `${space.id}/${floor.id}`;
  const shape = PROFILE_SHAPES[floor.profile ?? "standard"];
  const open = openFactor(space, at);
  if (open === 0) return 0;
  const clock = campusClock(at);
  const weekendWeight = dayBlend(at, clock.hour, (d) => (d.weekend ? 1 : 0));
  const term = dayBlend(at, clock.hour, (d) => calendarFactor(space.type, d));

  // Fixed per-floor personality so two "standard" floors still differ a little.
  const lag = shape.lag + 0.4 * randSigned(`${key}:lag`);
  const amplitude = shape.amplitude * (1 + 0.06 * randSigned(`${key}:amp`));
  // Some days are just busier (exams, weather…). Drifts smoothly across days
  // rather than stepping at midnight.
  const dayFactor = 1 + 0.06 * valueNoise(hashString(`${space.id}:day`), at.getTime() / 86_400_000, 1);

  const h = clock.hour - lag;
  const typical =
    baseCurve(space.type, h, false) * (1 - weekendWeight) + baseCurve(space.type, h, true) * weekendWeight;
  const base = typical ** shape.exponent * amplitude * dayFactor * term * open;

  // Two octaves of smooth noise over real time (minutes). Scaled down when the
  // floor is near-empty (or just opening) so it doesn't wobble between 0% and 8%.
  const seed = hashString(key);
  const minutes = at.getTime() / 60_000;
  const noise =
    (0.045 * valueNoise(seed, minutes, 20) + 0.015 * valueNoise(seed + 1, minutes, 5)) * (0.3 + base) * open;

  return Math.max(0, Math.min(MAX_RATIO, base + noise));
}

export function simulateFloorCount(space: SpaceConfig, floor: FloorConfig, at: Date): number {
  return Math.round(simulateFloorRatio(space, floor, at) * floor.capacity);
}
