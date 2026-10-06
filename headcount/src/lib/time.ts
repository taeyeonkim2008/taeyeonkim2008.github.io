import { CAMPUS_TIME_ZONE } from "@/config/spaces";

export interface CampusClock {
  /** Fractional hour of day in campus time, e.g. 14.5 = 2:30 pm. */
  hour: number;
  /** 0 = Sunday … 6 = Saturday */
  dayOfWeek: number;
  weekend: boolean;
  /** YYYY-MM-DD in campus time. */
  dateKey: string;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatters.set(timeZone, f);
  }
  return f;
}

const HOUR_MS = 3_600_000;
const offsets = new Map<string, number>();

/**
 * UTC offset (ms) of `timeZone` at `ms`. Intl is slow and the simulation calls
 * this a lot, so cache per UTC hour — DST switches always land on an hour.
 */
function utcOffset(ms: number, timeZone: string): number {
  const bucket = Math.floor(ms / HOUR_MS);
  const key = `${timeZone}|${bucket}`;
  let off = offsets.get(key);
  if (off === undefined) {
    const t = bucket * HOUR_MS;
    const p: Record<string, string> = {};
    for (const part of formatter(timeZone).formatToParts(new Date(t))) p[part.type] = part.value;
    off = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - t;
    if (offsets.size > 10_000) offsets.clear();
    offsets.set(key, off);
  }
  return off;
}

/** Wall-clock info for `date` as seen on campus. */
export function campusClock(date: Date, timeZone = CAMPUS_TIME_ZONE): CampusClock {
  const local = new Date(Math.floor(date.getTime() / 1000) * 1000 + utcOffset(date.getTime(), timeZone));
  const dayOfWeek = local.getUTCDay();
  return {
    hour: local.getUTCHours() + local.getUTCMinutes() / 60 + local.getUTCSeconds() / 3600,
    dayOfWeek,
    weekend: dayOfWeek === 0 || dayOfWeek === 6,
    dateKey: local.toISOString().slice(0, 10),
  };
}

/** Midpoint timestamp of each hour (0–23) of the campus day containing `now`. */
export function hoursOfCampusDay(now: Date, timeZone = CAMPUS_TIME_ZONE): Date[] {
  const { hour } = campusClock(now, timeZone);
  const dayStart = now.getTime() - hour * 3_600_000;
  return Array.from({ length: 24 }, (_, h) => new Date(dayStart + (h + 0.5) * 3_600_000));
}

export function formatHour(h: number): string {
  const suffix = h < 12 ? "a" : "p";
  const n = h % 12 === 0 ? 12 : h % 12;
  return `${n}${suffix}`;
}
