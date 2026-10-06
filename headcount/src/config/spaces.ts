import type { SpaceConfig } from "@/lib/types";

/** Campus time zone. Used for "time of day" in the simulation and the hourly chart. */
export const CAMPUS_TIME_ZONE = "America/New_York";

// TODO: PLACEHOLDER DATA. Floor names, capacities and profiles below are rough
// guesses for demo purposes only — replace them with real values before launch.
// `id`s must stay stable once a real data source is wired up, because the
// ApiProvider matches incoming counts to floors by these ids.
export const SPACES: SpaceConfig[] = [
  // TODO: placeholder — verify floors and capacities
  {
    id: "bobst",
    name: "Bobst Library",
    type: "study",
    subtitle: "70 Washington Sq S",
    floors: [
      { id: "ll1", name: "Lower Level 1", capacity: 240, profile: "standard" },
      { id: "f2", name: "Floor 2", capacity: 180, profile: "social" },
      { id: "f3", name: "Floor 3", capacity: 160, profile: "standard" },
      { id: "f4", name: "Floor 4", capacity: 150, profile: "standard" },
      { id: "f5", name: "Floor 5 · Quiet", capacity: 140, profile: "quiet" },
      { id: "f6", name: "Floor 6 · Silent", capacity: 120, profile: "quiet" },
    ],
  },
  // TODO: placeholder — verify floors and capacities
  {
    id: "paulson",
    name: "Paulson Center",
    type: "study",
    subtitle: "181 Mercer St",
    floors: [
      { id: "f2", name: "Floor 2 · Lounge", capacity: 120, profile: "social" },
      { id: "f4", name: "Floor 4", capacity: 90, profile: "standard" },
      { id: "f5", name: "Floor 5 · Quiet", capacity: 70, profile: "quiet" },
    ],
  },
  // TODO: placeholder — verify areas and capacities
  {
    id: "palladium-gym",
    name: "Palladium Athletic Facility",
    type: "gym",
    subtitle: "140 E 14th St",
    floors: [
      { id: "cardio", name: "Cardio Floor", capacity: 80, profile: "cardio" },
      { id: "weights", name: "Weight Room", capacity: 70, profile: "weights" },
      { id: "courts", name: "Courts", capacity: 50, profile: "courts" },
    ],
  },
  // TODO: placeholder — verify seating areas and capacities
  {
    id: "downstein",
    name: "Downstein",
    type: "dining",
    subtitle: "Weinstein Hall, lower level",
    floors: [
      { id: "main", name: "Main Hall", capacity: 300 },
      { id: "mezz", name: "Side Room", capacity: 90 },
    ],
  },
  // TODO: placeholder — verify seating areas and capacities
  {
    id: "lipton",
    name: "Lipton Dining Hall",
    type: "dining",
    subtitle: "33 Washington Sq W",
    floors: [{ id: "main", name: "Dining Room", capacity: 220 }],
  },
];

export function getSpace(id: string): SpaceConfig | undefined {
  return SPACES.find((s) => s.id === id);
}
