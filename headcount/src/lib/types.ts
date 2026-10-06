// Shared domain types. The UI depends only on these — never on a specific provider.

export type SpaceType = "study" | "gym" | "dining";

/**
 * Optional hint about how a floor tends to fill up. Only the SimulatedProvider
 * reads this; a real data source ignores it.
 */
export type FloorProfile =
  | "standard"
  | "quiet" // silent study: fills slowly, peaks later and a bit lower
  | "social" // group study / lounges: fills fast
  | "cardio" // gym: busier earlier in the day
  | "weights" // gym: busier in the evening
  | "courts"; // gym: late-evening pickup games

export interface FloorConfig {
  id: string;
  name: string;
  capacity: number;
  profile?: FloorProfile;
}

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** Opening interval in campus time, "HH:MM" 24-hour. Close may be "24:00". */
export type TimeRange = readonly [open: string, close: string];

export type OpeningHours =
  | "24/7"
  | {
      weekly: Record<Weekday, readonly TimeRange[]>;
      /** Date-specific overrides keyed "YYYY-MM-DD" (holidays). Empty array = closed. */
      exceptions?: Record<string, readonly TimeRange[]>;
    };

export interface SpaceConfig {
  id: string;
  name: string;
  type: SpaceType;
  /** Short line shown under the name, e.g. the address or a hint. */
  subtitle?: string;
  /** Omitted = always open. */
  hours?: OpeningHours;
  floors: FloorConfig[];
}

/** One reading for one floor. `count` is an anonymous aggregate (people or devices). */
export interface FloorOccupancy {
  floorId: string;
  count: number;
  capacity: number;
  /** ISO-8601 time the reading was taken. */
  timestamp: string;
}

export interface SpaceOccupancy {
  spaceId: string;
  floors: FloorOccupancy[];
  timestamp: string;
}

/** Overall busyness for one hour of the current campus day (0–23). */
export interface HourlyPoint {
  hour: number;
  /** 0–100 */
  percent: number;
}

/**
 * The single seam between data and UI. Implement this to plug in a new source
 * (Wi-Fi AP counts, ID swipes, door counters, …) — nothing else needs to change.
 */
export interface OccupancyProvider {
  /** Short identifier shown in the API response, e.g. "simulated". */
  readonly id: string;
  /** True when the numbers are not real. Drives the "Demo" badge. */
  readonly isSimulated: boolean;
  /** Current per-floor readings for every configured space. */
  getCurrent(): Promise<SpaceOccupancy[]>;
  /** Today's hourly busyness curve for one space (history so far + expected for the rest of the day). */
  getToday(spaceId: string): Promise<HourlyPoint[]>;
}

/** Shape returned by /api/occupancy and consumed by the client. */
export interface OccupancySnapshot {
  provider: string;
  isSimulated: boolean;
  fetchedAt: string;
  /** The moment the readings describe — "now", or a demo preview time. */
  asOf: string;
  /** True when showing a demo preview time rather than now. */
  preview: boolean;
  spaces: SpaceOccupancy[];
}

export interface SpaceDetailSnapshot extends OccupancySnapshot {
  today: HourlyPoint[];
}
