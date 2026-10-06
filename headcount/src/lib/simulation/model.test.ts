import { describe, expect, it } from "vitest";
import type { SpaceConfig, SpaceType } from "@/lib/types";
import { SPACES } from "@/config/spaces";
import { campusClock } from "@/lib/time";
import { MAX_RATIO, baseCurve, simulateFloorCount, simulateFloorRatio } from "./model";
import { SimulatedProvider } from "@/lib/providers/simulated-provider";
import { spacePercent } from "@/lib/busyness";

// October 2026 in New York is EDT (UTC−4). 2026-10-07 is a Wednesday, 2026-10-10 a Saturday.
const WEEKDAY = "2026-10-07";
const SATURDAY = "2026-10-10";
const at = (day: string, hour: number, minute = 0) =>
  new Date(`${day}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00-04:00`);

const space = (type: SpaceType, profiles: SpaceConfig["floors"][number]["profile"][] = ["standard"]): SpaceConfig => ({
  id: `test-${type}`,
  name: "Test",
  type,
  floors: profiles.map((profile, i) => ({ id: `f${i}`, name: `F${i}`, capacity: 200, profile })),
});

/** Average ratio over a window, to compare patterns without noise. */
function avgRatio(s: SpaceConfig, floorIdx: number, day: string, hour: number): number {
  let sum = 0;
  for (let m = 0; m < 60; m += 5) sum += simulateFloorRatio(s, s.floors[floorIdx], at(day, hour, m));
  return sum / 12;
}

describe("campusClock", () => {
  it("reads wall-clock time in campus time zone", () => {
    const c = campusClock(at(WEEKDAY, 14, 30));
    expect(c.hour).toBeCloseTo(14.5);
    expect(c.dayOfWeek).toBe(3);
    expect(c.weekend).toBe(false);
    expect(c.dateKey).toBe(WEEKDAY);
    expect(campusClock(at(SATURDAY, 9)).weekend).toBe(true);
  });

  it("handles the daylight-saving switch (Nov 1, 2026)", () => {
    expect(campusClock(new Date("2026-10-31T23:30:00-04:00"))).toMatchObject({ hour: 23.5, dateKey: "2026-10-31" });
    expect(campusClock(new Date("2026-11-01T01:30:00-05:00"))).toMatchObject({ hour: 1.5, dateKey: "2026-11-01" });
    expect(campusClock(new Date("2026-11-01T12:00:00-05:00"))).toMatchObject({ hour: 12, dayOfWeek: 0 });
  });
});

describe("baseCurve", () => {
  it("stays within [0, 1] for every type, hour and day kind", () => {
    for (const type of ["study", "gym", "dining"] as const)
      for (const weekend of [false, true])
        for (let h = 0; h < 24; h += 0.25) {
          const v = baseCurve(type, h, weekend);
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(1);
        }
  });
});

describe("daily patterns", () => {
  it("study spaces: quiet early morning, peaks midday and evening, quieter late night", () => {
    const s = space("study");
    const early = avgRatio(s, 0, WEEKDAY, 5);
    const midday = avgRatio(s, 0, WEEKDAY, 14);
    const evening = avgRatio(s, 0, WEEKDAY, 20);
    const late = avgRatio(s, 0, WEEKDAY, 2);
    expect(early).toBeLessThan(0.15);
    expect(midday).toBeGreaterThan(0.6);
    expect(evening).toBeGreaterThan(0.6);
    expect(late).toBeLessThan(evening / 2);
  });

  it("gyms peak in the evening", () => {
    const s = space("gym");
    const evening = avgRatio(s, 0, WEEKDAY, 18);
    for (const h of [3, 10, 14, 22]) expect(avgRatio(s, 0, WEEKDAY, h)).toBeLessThan(evening);
    expect(evening).toBeGreaterThan(0.7);
  });

  it("dining halls spike at lunch and dinner, not mid-afternoon", () => {
    const s = space("dining");
    const lunch = avgRatio(s, 0, WEEKDAY, 12);
    const dinner = avgRatio(s, 0, WEEKDAY, 18);
    const afternoon = avgRatio(s, 0, WEEKDAY, 15);
    expect(lunch).toBeGreaterThan(0.7);
    expect(dinner).toBeGreaterThan(0.7);
    expect(afternoon).toBeLessThan(lunch / 2);
  });

  it("weekends are quieter for study and dining", () => {
    for (const type of ["study", "dining"] as const) {
      const s = space(type);
      const peak = (day: string) => Math.max(...Array.from({ length: 24 }, (_, h) => avgRatio(s, 0, day, h)));
      expect(peak(SATURDAY)).toBeLessThan(peak(WEEKDAY) * 0.8);
    }
  });

  it("quiet floors fill more slowly than social floors in the same building", () => {
    const s = space("study", ["quiet", "social"]);
    const quietMorning = avgRatio(s, 0, WEEKDAY, 10);
    const socialMorning = avgRatio(s, 1, WEEKDAY, 10);
    expect(quietMorning).toBeLessThan(socialMorning * 0.75);
  });
});

describe("bounds and smoothness", () => {
  it("never goes negative or above capacity, for every configured floor across a week", () => {
    for (const s of SPACES)
      for (const f of s.floors)
        for (let h = 0; h < 24 * 7; h += 0.5) {
          const t = new Date(at(WEEKDAY, 0).getTime() + h * 3_600_000);
          const r = simulateFloorRatio(s, f, t);
          expect(r).toBeGreaterThanOrEqual(0);
          expect(r).toBeLessThanOrEqual(MAX_RATIO);
          const c = simulateFloorCount(s, f, t);
          expect(Number.isInteger(c)).toBe(true);
          expect(c).toBeLessThanOrEqual(f.capacity);
        }
  });

  it("is deterministic for the same instant", () => {
    const s = SPACES[0];
    const t = at(WEEKDAY, 13, 17);
    expect(simulateFloorRatio(s, s.floors[0], t)).toBe(simulateFloorRatio(s, s.floors[0], t));
  });

  /** Largest change between consecutive 30-second samples over `days` from `start`. */
  const maxStepOver = (s: SpaceConfig, f: SpaceConfig["floors"][number], start: number, days: number) => {
    let maxStep = 0;
    let prev = simulateFloorRatio(s, f, new Date(start));
    for (let sec = 30; sec <= days * 24 * 3600; sec += 30) {
      const cur = simulateFloorRatio(s, f, new Date(start + sec * 1000));
      maxStep = Math.max(maxStep, Math.abs(cur - prev));
      prev = cur;
    }
    return maxStep;
  };

  it("changes by at most ~2 points between 30-second refreshes, all week (incl. midnight, weekend, opening and closing)", () => {
    const start = at("2026-10-05", 0).getTime(); // Monday
    for (const s of SPACES) for (const f of s.floors) expect(maxStepOver(s, f, start, 7)).toBeLessThan(0.02);
  });

  it("stays smooth across calendar changes (Thanksgiving, finals → winter break)", () => {
    for (const start of [new Date("2026-11-23T00:00:00-05:00"), new Date("2026-12-20T00:00:00-05:00")])
      for (const s of SPACES) expect(maxStepOver(s, s.floors[0], start.getTime(), 7)).toBeLessThan(0.02);
  });

  it("has visible noise (not a perfectly flat curve)", () => {
    const s = space("study");
    const values = Array.from({ length: 12 }, (_, i) => simulateFloorRatio(s, s.floors[0], at(WEEKDAY, 14, i * 5)));
    expect(new Set(values.map((v) => v.toFixed(3))).size).toBeGreaterThan(6);
  });
});

describe("opening hours and the academic calendar", () => {
  const byId = (id: string) => SPACES.find((s) => s.id === id)!;
  const palladium = byId("palladium-gym");
  const downstein = byId("downstein");
  const bobst = byId("bobst");
  const stacks = bobst.floors.find((f) => f.id === "f4")!;
  const est = (day: string, hour: number) => new Date(`${day}T${String(hour).padStart(2, "0")}:00:00-05:00`);
  const avgAt = (s: SpaceConfig, f: SpaceConfig["floors"][number], t: Date) => {
    let sum = 0;
    for (let m = 0; m < 60; m += 5) sum += simulateFloorRatio(s, f, new Date(t.getTime() + m * 60_000));
    return sum / 12;
  };

  it("reads exactly zero while a space is closed", () => {
    expect(simulateFloorRatio(palladium, palladium.floors[0], at(WEEKDAY, 6))).toBe(0); // opens 7:30
    expect(simulateFloorRatio(downstein, downstein.floors[0], at(WEEKDAY, 15, 30))).toBe(0); // 3–4 pm break
    expect(simulateFloorRatio(palladium, palladium.floors[0], est("2026-11-26", 12))).toBe(0); // Thanksgiving
  });

  it("fills gradually after opening instead of jumping", () => {
    const justOpened = simulateFloorRatio(palladium, palladium.floors[0], at(WEEKDAY, 7, 35));
    const hourLater = simulateFloorRatio(palladium, palladium.floors[0], at(WEEKDAY, 8, 30));
    expect(justOpened).toBeLessThan(hourLater * 0.3);
  });

  it("is much quieter over Thanksgiving and busier during finals", () => {
    const normalThu = avgAt(bobst, stacks, est("2026-11-19", 14));
    const thanksgiving = avgAt(bobst, stacks, est("2026-11-26", 14));
    expect(thanksgiving).toBeLessThan(normalThu * 0.5);

    const normalWed = avgAt(bobst, stacks, est("2026-12-02", 14));
    const finalsWed = avgAt(bobst, stacks, est("2026-12-16", 14));
    expect(finalsWed).toBeGreaterThan(normalWed * 1.15);
  });
});

describe("SimulatedProvider", () => {
  const now = at(WEEKDAY, 15, 10);
  const provider = new SimulatedProvider({ spaces: SPACES, now: () => now });

  it("returns one reading per configured floor, stamped with the current time", async () => {
    const current = await provider.getCurrent();
    expect(current.map((c) => c.spaceId)).toEqual(SPACES.map((s) => s.id));
    for (const c of current) {
      const cfg = SPACES.find((s) => s.id === c.spaceId)!;
      expect(c.floors.map((f) => f.floorId)).toEqual(cfg.floors.map((f) => f.id));
      for (const f of c.floors) expect(f.timestamp).toBe(now.toISOString());
    }
  });

  it("returns 24 hourly points for today, consistent with the live reading", async () => {
    const today = await provider.getToday("bobst");
    expect(today.map((p) => p.hour)).toEqual(Array.from({ length: 24 }, (_, i) => i));
    const live = spacePercent((await provider.getCurrent()).find((c) => c.spaceId === "bobst")!);
    // Live is at 3:10 pm; the 3 pm bucket is sampled at 3:30 pm.
    expect(Math.abs(today[15].percent - live)).toBeLessThan(10);
  });

  it("rejects unknown spaces", async () => {
    await expect(provider.getToday("nope")).rejects.toThrow();
  });
});
