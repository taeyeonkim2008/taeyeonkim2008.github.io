import { describe, expect, it } from "vitest";
import { getSpace } from "@/config/spaces";
import { formatClock, isOpen, openDuringHour, openStatus } from "./hours";
import { previewTime } from "./demoClock";
import { campusClock } from "./time";

// Fall 2026 dates in New York are EDT (UTC−4) until Nov 1, then EST (UTC−5).
const edt = (day: string, time: string) => new Date(`${day}T${time}:00-04:00`);
const est = (day: string, time: string) => new Date(`${day}T${time}:00-05:00`);

const palladium = getSpace("palladium-gym")!;
const downstein = getSpace("downstein")!;
const bobst = getSpace("bobst")!;
const fitness404 = getSpace("404-fitness")!;

describe("formatClock", () => {
  it.each([
    [0, "12 AM"],
    [450, "7:30 AM"],
    [720, "12 PM"],
    [1320, "10 PM"],
    [1440, "midnight"],
  ])("%i → %s", (min, label) => expect(formatClock(min)).toBe(label));
});

describe("openStatus", () => {
  it("is always open for 24/7 spaces", () => {
    expect(openStatus(bobst, edt("2026-10-07", "03:00"))).toEqual({ open: true, label: "Open 24 hours" });
  });

  it("says when an open space closes", () => {
    expect(openStatus(palladium, edt("2026-10-07", "21:00"))).toEqual({ open: true, label: "Closes 10 PM" });
  });

  it("says when a closed space opens — later today, tomorrow, or on a named day", () => {
    expect(openStatus(palladium, edt("2026-10-07", "07:00")).label).toBe("Opens 7:30 AM");
    expect(openStatus(downstein, edt("2026-10-07", "15:30")).label).toBe("Opens 4 PM");
    expect(openStatus(palladium, edt("2026-10-09", "22:00")).label).toBe("Opens tomorrow 8 AM");
  });

  it("applies date-specific closures", () => {
    // 404 Fitness: closed for repairs Wed–Fri Oct 7–9.
    expect(isOpen(fitness404, edt("2026-10-08", "12:00"))).toBe(false);
    expect(openStatus(fitness404, edt("2026-10-08", "12:00")).label).toBe("Opens Sat 8 AM");
    // Thanksgiving: gyms closed Nov 26–28, reopen Sunday.
    expect(openStatus(palladium, est("2026-11-26", "12:00")).label).toBe("Opens Sun 12 PM");
    expect(isOpen(palladium, est("2026-11-25", "13:00"))).toBe(false); // closes at noon
  });
});

describe("openDuringHour", () => {
  it("counts an hour as open if the space is open for part of it", () => {
    expect(openDuringHour(downstein, edt("2026-10-07", "10:30"))).toBe(true); // breakfast until 10:30
    expect(openDuringHour(downstein, edt("2026-10-07", "15:30"))).toBe(false); // 3–4 pm break
  });
});

describe("previewTime", () => {
  it("lands on hh:30 of the chosen weekday in the current campus week", () => {
    const now = edt("2026-10-07", "10:12"); // Wednesday
    const t = campusClock(new Date(previewTime(0, 14, now))); // Monday 2 pm
    expect(t.dateKey).toBe("2026-10-05");
    expect(t.hour).toBeCloseTo(14.5);
    expect(campusClock(new Date(previewTime(6, 2, now))).dateKey).toBe("2026-10-11"); // Sunday
  });
});
