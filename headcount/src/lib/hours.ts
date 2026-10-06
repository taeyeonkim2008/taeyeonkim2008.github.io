// Opening hours: is a space open at a given moment, and what to tell the user.
// Pure functions of (config, time), shared by the UI and the simulation.

import type { OpeningHours, SpaceConfig, Weekday } from "@/lib/types";
import { campusClock } from "@/lib/time";

const DAY_KEYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_MS = 86_400_000;

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const isAlwaysOpen = (hours: OpeningHours | undefined) => !hours || hours === "24/7";

/** Opening intervals [start, end) in minutes after campus midnight, for one campus date. */
export function intervalsOn(hours: OpeningHours | undefined, dateKey: string, dayOfWeek: number): [number, number][] {
  if (!hours || hours === "24/7") return [[0, 1440]];
  const ranges = hours.exceptions?.[dateKey] ?? hours.weekly[DAY_KEYS[dayOfWeek]];
  return ranges.map(([a, b]) => [toMinutes(a), toMinutes(b)]);
}

export interface OpenWindow {
  open: boolean;
  /** Minutes since the current opening began (Infinity if always open). */
  minutesSinceOpen: number;
  /** Minutes until the current opening ends (Infinity if always open). */
  minutesUntilClose: number;
}

export function openWindow(space: SpaceConfig, at: Date): OpenWindow {
  if (isAlwaysOpen(space.hours)) return { open: true, minutesSinceOpen: Infinity, minutesUntilClose: Infinity };
  const c = campusClock(at);
  const m = c.hour * 60;
  for (const [a, b] of intervalsOn(space.hours, c.dateKey, c.dayOfWeek)) {
    if (a <= m && m < b) return { open: true, minutesSinceOpen: m - a, minutesUntilClose: b - m };
  }
  return { open: false, minutesSinceOpen: 0, minutesUntilClose: 0 };
}

export const isOpen = (space: SpaceConfig, at: Date) => openWindow(space, at).open;

/** "7:30 AM", "10 PM", "midnight". */
export function formatClock(minutes: number): string {
  if (minutes >= 1440) return "midnight";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
}

export interface OpenStatus {
  open: boolean;
  /** e.g. "Open 24 hours", "Closes 10 PM", "Opens 4 PM", "Opens tomorrow 7 AM", "Opens Sun 12 PM" */
  label: string;
}

export function openStatus(space: SpaceConfig, at: Date): OpenStatus {
  if (isAlwaysOpen(space.hours)) return { open: true, label: "Open 24 hours" };
  const w = openWindow(space, at);
  const c = campusClock(at);
  const m = c.hour * 60;
  if (w.open) return { open: true, label: `Closes ${formatClock(m + w.minutesUntilClose)}` };

  const laterToday = intervalsOn(space.hours, c.dateKey, c.dayOfWeek).find(([a]) => a > m);
  if (laterToday) return { open: false, label: `Opens ${formatClock(laterToday[0])}` };
  for (let k = 1; k <= 7; k++) {
    const d = campusClock(new Date(at.getTime() + k * DAY_MS));
    const first = intervalsOn(space.hours, d.dateKey, d.dayOfWeek)[0];
    if (first) {
      const when = k === 1 ? "tomorrow" : DAY_SHORT[d.dayOfWeek];
      return { open: false, label: `Opens ${when} ${formatClock(first[0])}` };
    }
  }
  return { open: false, label: "Closed" };
}

/** Whether a space is open for any meaningful part of the hour whose midpoint is `mid`. */
export function openDuringHour(space: SpaceConfig, mid: Date): boolean {
  return [-25, 0, 25].some((min) => isOpen(space, new Date(mid.getTime() + min * 60_000)));
}
