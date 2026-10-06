import { describe, expect, it } from "vitest";
import type { SpaceConfig, SpaceOccupancy } from "@/lib/types";
import { bestStudySpot, floorPercent, levelFor, spacePercent } from "./busyness";

describe("levelFor", () => {
  it.each([
    [0, "empty"],
    [24, "empty"],
    [25, "moderate"],
    [59, "moderate"],
    [60, "busy"],
    [85, "busy"],
    [86, "packed"],
    [100, "packed"],
  ])("%i%% → %s", (pct, level) => expect(levelFor(pct)).toBe(level));
});

describe("percentages", () => {
  it("rounds and clamps floor percent", () => {
    expect(floorPercent({ count: 1, capacity: 3 })).toBe(33);
    expect(floorPercent({ count: 500, capacity: 100 })).toBe(100);
    expect(floorPercent({ count: 5, capacity: 0 })).toBe(0);
  });

  it("weights space percent by capacity", () => {
    const s: SpaceOccupancy = {
      spaceId: "x",
      timestamp: "",
      floors: [
        { floorId: "a", count: 90, capacity: 100, timestamp: "" },
        { floorId: "b", count: 0, capacity: 300, timestamp: "" },
      ],
    };
    expect(spacePercent(s)).toBe(23);
  });
});

describe("bestStudySpot", () => {
  const spaces: SpaceConfig[] = [
    { id: "lib", name: "Lib", type: "study", floors: [{ id: "1", name: "One", capacity: 100 }, { id: "2", name: "Two", capacity: 200 }] },
    { id: "gym", name: "Gym", type: "gym", floors: [{ id: "g", name: "G", capacity: 50 }] },
  ];
  const reading = (spaceId: string, floors: [string, number, number][]): SpaceOccupancy => ({
    spaceId,
    timestamp: "",
    floors: floors.map(([floorId, count, capacity]) => ({ floorId, count, capacity, timestamp: "" })),
  });

  it("picks the least busy study floor and ignores other types", () => {
    const spot = bestStudySpot(spaces, [
      reading("lib", [["1", 50, 100], ["2", 40, 200]]),
      reading("gym", [["g", 0, 50]]),
    ]);
    expect(spot).toMatchObject({ floorId: "2", floorName: "Two", percent: 20 });
    expect(spot?.space.id).toBe("lib");
  });

  it("breaks ties toward the larger floor", () => {
    const spot = bestStudySpot(spaces, [reading("lib", [["1", 10, 100], ["2", 20, 200]])]);
    expect(spot?.floorId).toBe("2");
  });

  it("returns null with no study data", () => {
    expect(bestStudySpot(spaces, [])).toBeNull();
  });
});
