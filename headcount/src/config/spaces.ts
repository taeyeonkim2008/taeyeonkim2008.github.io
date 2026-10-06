import type { OpeningHours, SpaceConfig, TimeRange, Weekday } from "@/lib/types";

/** Campus time zone. Used for "time of day" in the simulation and the hourly chart. */
export const CAMPUS_TIME_ZONE = "America/New_York";

/** Build weekly hours from the usual Mon–Thu / Fri / Sat / Sun groupings. */
function weekly(
  days: { monThu: TimeRange[]; fri?: TimeRange[]; sat: TimeRange[]; sun?: TimeRange[] },
  exceptions?: Record<string, TimeRange[]>,
): OpeningHours {
  const fri = days.fri ?? days.monThu;
  const sun = days.sun ?? days.sat;
  const w: Record<Weekday, TimeRange[]> = {
    mon: days.monThu, tue: days.monThu, wed: days.monThu, thu: days.monThu, fri, sat: days.sat, sun,
  };
  return { weekly: w, exceptions };
}

/** Thanksgiving week changes, as published for every NYU athletic facility in fall 2026. */
const gymThanksgiving = (wed: TimeRange, sun: TimeRange): Record<string, TimeRange[]> => ({
  "2026-11-25": [wed],
  "2026-11-26": [],
  "2026-11-27": [],
  "2026-11-28": [],
  "2026-11-29": [sun],
});

// ─────────────────────────────────────────────────────────────────────────────
// Names, floors, noise designations and hours below come from NYU's public
// pages (checked Oct 2026):
//   • Bobst floors & quiet areas — library.nyu.edu/spaces, library.answers.nyu.edu/faq/100238
//   • Gym hours (Fall 2026, 8/31–12/13) — gonyuathletics.com "Facilities Hours & Access"
//   • Dining hours (Fall 2026) — nyu.edu → Housing & Dining → Hours of Operation
//
// TODO: CAPACITIES ARE ESTIMATES. NYU doesn't publish per-floor seat counts.
// Bobst's are scaled from the ~3,000 total seats reported by Washington Square
// News; everything else is a guess. Replace with real numbers when available.
// `id`s must stay stable once real data is wired up (the ApiProvider matches by id).
// ─────────────────────────────────────────────────────────────────────────────
export const SPACES: SpaceConfig[] = [
  {
    id: "bobst",
    name: "Bobst Library",
    type: "study",
    subtitle: "70 Washington Sq S",
    // Open 24 hours with NYU ID; only visitors and alumni are restricted 1–7 am.
    hours: "24/7",
    floors: [
      { id: "ll2", name: "LL2 · Individual Study", capacity: 160, profile: "quiet" },
      { id: "ll1", name: "LL1 · Group Study", capacity: 320, profile: "social" },
      { id: "f2", name: "Floor 2 · North Reading Room", capacity: 260, profile: "quiet" },
      { id: "f4", name: "Floor 4 · Stacks", capacity: 240, profile: "standard" },
      { id: "f5", name: "Floor 5 · Stacks", capacity: 220, profile: "standard" },
      { id: "f6", name: "Floor 6 · Stacks", capacity: 240, profile: "standard" },
      { id: "f7", name: "Floor 7 · Group Study & Media", capacity: 220, profile: "social" },
      { id: "f8", name: "Floor 8 · Stacks", capacity: 220, profile: "standard" },
      { id: "f9", name: "Floor 9 · Stacks", capacity: 200, profile: "quiet" },
      { id: "f10", name: "Floor 10 · Reading Room", capacity: 200, profile: "quiet" },
    ],
  },
  {
    id: "paulson-study",
    name: "Paulson Center",
    type: "study",
    subtitle: "181 Mercer St · study commons",
    // TODO: unverified — building hours for study areas aren't published.
    hours: weekly({ monThu: [["07:00", "24:00"]], sat: [["08:00", "24:00"]] }),
    // TODO: unverified — area names are descriptive, not official.
    floors: [
      { id: "commons-lower", name: "Lower Commons", capacity: 140, profile: "social" },
      { id: "commons-mid", name: "Mid-level Study Areas", capacity: 110, profile: "standard" },
      { id: "commons-upper", name: "Upper Quiet Study", capacity: 80, profile: "quiet" },
    ],
  },
  {
    id: "paulson-gym",
    name: "Paulson Center Athletics",
    type: "gym",
    subtitle: "181 Mercer St",
    hours: weekly(
      { monThu: [["06:30", "22:00"]], fri: [["06:30", "21:00"]], sat: [["08:00", "20:00"]] },
      gymThanksgiving(["06:30", "12:00"], ["10:00", "20:00"]),
    ),
    floors: [
      { id: "fitness", name: "Cardio & Weight Room", capacity: 120, profile: "weights" },
      { id: "courts", name: "Courts", capacity: 80, profile: "courts" },
      { id: "pool", name: "Lap Pool", capacity: 36, profile: "cardio" },
    ],
  },
  {
    id: "palladium-gym",
    name: "Palladium Athletic Facility",
    type: "gym",
    subtitle: "140 E 14th St",
    hours: weekly(
      { monThu: [["07:30", "22:00"]], fri: [["07:30", "21:00"]], sat: [["08:00", "20:00"]] },
      gymThanksgiving(["07:30", "12:00"], ["12:00", "20:00"]),
    ),
    floors: [
      { id: "weights", name: "Weights & Cardio", capacity: 90, profile: "weights" },
      { id: "court", name: "Basketball Court", capacity: 40, profile: "courts" },
      { id: "pool", name: "Pool", capacity: 40, profile: "cardio" },
    ],
  },
  {
    id: "404-fitness",
    name: "404 Fitness",
    type: "gym",
    subtitle: "404 Lafayette St",
    hours: weekly(
      { monThu: [["06:00", "22:30"]], fri: [["06:00", "20:00"]], sat: [["08:00", "20:00"]] },
      {
        "2026-10-07": [],
        "2026-10-08": [],
        "2026-10-09": [], // closed for repairs
        ...gymThanksgiving(["06:00", "12:00"], ["10:00", "20:00"]),
      },
    ),
    floors: [
      { id: "strength", name: "Strength Floor", capacity: 70, profile: "weights" },
      { id: "cardio", name: "Cardio Rooms", capacity: 50, profile: "cardio" },
      { id: "turf", name: "Turf Strip", capacity: 20, profile: "standard" },
    ],
  },
  {
    id: "downstein",
    name: "Downstein",
    type: "dining",
    subtitle: "Weinstein Hall, lower level",
    hours: weekly({
      monThu: [["07:00", "10:30"], ["11:00", "15:00"], ["16:00", "21:00"]],
      sat: [["09:00", "15:00"], ["16:00", "21:00"]],
    }),
    floors: [{ id: "main", name: "Dining Hall", capacity: 380 }],
  },
  {
    id: "third-north",
    name: "Third North",
    type: "dining",
    subtitle: "75 Third Ave",
    hours: weekly({
      monThu: [["07:30", "10:30"], ["11:00", "15:00"], ["16:00", "21:00"]],
      sat: [["10:00", "15:00"], ["16:00", "21:00"]],
    }),
    floors: [{ id: "main", name: "Dining Hall", capacity: 260 }],
  },
  {
    id: "lipton",
    name: "Lipton",
    type: "dining",
    subtitle: "33 Washington Sq W",
    hours: weekly({
      monThu: [["07:30", "10:30"], ["11:00", "15:00"], ["16:00", "21:00"]],
      sat: [["11:00", "15:00"], ["16:00", "20:00"]],
    }),
    floors: [{ id: "main", name: "Dining Hall", capacity: 240 }],
  },
];

export function getSpace(id: string): SpaceConfig | undefined {
  return SPACES.find((s) => s.id === id);
}
