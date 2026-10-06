// Turning raw counts into what the UI shows: percentages, labels, rankings.

import type { FloorOccupancy, SpaceConfig, SpaceOccupancy } from "@/lib/types";

export type BusynessLevel = "empty" | "moderate" | "busy" | "packed";

export const LEVEL_LABEL: Record<BusynessLevel, string> = {
  empty: "Empty",
  moderate: "Moderate",
  busy: "Busy",
  packed: "Packed",
};

/** Empty < 25% ≤ Moderate < 60% ≤ Busy ≤ 85% < Packed */
export function levelFor(percent: number): BusynessLevel {
  if (percent < 25) return "empty";
  if (percent < 60) return "moderate";
  if (percent <= 85) return "busy";
  return "packed";
}

export function floorPercent(f: Pick<FloorOccupancy, "count" | "capacity">): number {
  if (f.capacity <= 0) return 0;
  return Math.min(100, Math.round((f.count / f.capacity) * 100));
}

/** Capacity-weighted busyness across all floors of a space. */
export function spacePercent(s: SpaceOccupancy): number {
  const count = s.floors.reduce((n, f) => n + f.count, 0);
  const capacity = s.floors.reduce((n, f) => n + f.capacity, 0);
  return floorPercent({ count, capacity });
}

export interface BestSpot {
  space: SpaceConfig;
  floorId: string;
  floorName: string;
  percent: number;
}

/**
 * The least busy study floor right now. Ties go to the bigger floor (more seats
 * free). Returns null when there's no study data.
 */
export function bestStudySpot(spaces: SpaceConfig[], data: SpaceOccupancy[]): BestSpot | null {
  let best: (BestSpot & { capacity: number }) | null = null;
  for (const space of spaces) {
    if (space.type !== "study") continue;
    const occ = data.find((d) => d.spaceId === space.id);
    if (!occ) continue;
    for (const f of occ.floors) {
      const floor = space.floors.find((x) => x.id === f.floorId);
      if (!floor) continue;
      const percent = floorPercent(f);
      if (!best || percent < best.percent || (percent === best.percent && f.capacity > best.capacity)) {
        best = { space, floorId: f.floorId, floorName: floor.name, percent, capacity: f.capacity };
      }
    }
  }
  if (!best) return null;
  const { capacity: _, ...spot } = best;
  return spot;
}
