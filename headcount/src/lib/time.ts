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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatters.set(timeZone, f);
  }
  return f;
}

/** Wall-clock info for `date` as seen on campus. */
export function campusClock(date: Date, timeZone = CAMPUS_TIME_ZONE): CampusClock {
  const parts: Record<string, string> = {};
  for (const p of formatter(timeZone).formatToParts(date)) parts[p.type] = p.value;
  const dayOfWeek = WEEKDAYS.indexOf(parts.weekday);
  const hour = Number(parts.hour) + Number(parts.minute) / 60 + Number(parts.second) / 3600;
  return {
    hour,
    dayOfWeek,
    weekend: dayOfWeek === 0 || dayOfWeek === 6,
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
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
