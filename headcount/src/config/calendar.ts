import type { SpaceType } from "@/lib/types";

// Academic-calendar effects on busyness. Dates are from NYU's published
// 2026–27 academic calendar (bulletins.nyu.edu/nyu/academic-calendar), except
// where marked "approximate". Only the simulation uses the multipliers; the
// `notice` text is shown in the app whatever the data source.

export interface CalendarPeriod {
  /** Inclusive, "YYYY-MM-DD" in campus time. */
  start: string;
  end: string;
  label: string;
  /** Shown as a banner on the home screen while the period is active. */
  notice?: string;
  /** Multiplier on typical busyness for each space type. */
  factor: Record<SpaceType, number>;
}

const f = (study: number, gym: number, dining: number) => ({ study, gym, dining });

export const CALENDAR: CalendarPeriod[] = [
  { start: "2026-05-13", end: "2026-08-30", label: "Summer", notice: "Summer — campus is much quieter than during the semester.", factor: f(0.3, 0.45, 0.35) },
  { start: "2026-08-31", end: "2026-09-01", label: "Move-in", factor: f(0.5, 0.7, 0.85) },
  { start: "2026-09-07", end: "2026-09-07", label: "Labor Day", notice: "Labor Day — no classes today.", factor: f(0.75, 0.85, 0.8) },
  { start: "2026-10-12", end: "2026-10-12", label: "Fall Break", notice: "Fall Break — no classes today.", factor: f(0.7, 0.85, 0.75) },
  // Approximate: NYU has no official midterm week, but mid–late October is peak season.
  { start: "2026-10-13", end: "2026-10-23", label: "Midterm season", factor: f(1.12, 0.95, 1) },
  { start: "2026-11-25", end: "2026-11-25", label: "Thanksgiving Eve", notice: "Many students have left for Thanksgiving. Gyms close at noon.", factor: f(0.6, 0.6, 0.6) },
  { start: "2026-11-26", end: "2026-11-29", label: "Thanksgiving Recess", notice: "Thanksgiving Recess — campus is quiet. Gyms are closed Nov 26–28.", factor: f(0.25, 0.5, 0.3) },
  // Approximate: end-of-semester crunch before the last day of classes (Dec 14).
  { start: "2026-12-07", end: "2026-12-14", label: "Last week of classes", factor: f(1.15, 0.9, 1) },
  // Inferred: the gap between the last day of classes and the first exam.
  { start: "2026-12-15", end: "2026-12-15", label: "Reading Day", notice: "Reading Day — expect study spaces to fill early.", factor: f(1.3, 0.8, 0.95) },
  { start: "2026-12-16", end: "2026-12-22", label: "Final Exams", notice: "Finals week — study spaces fill up fast. Go early.", factor: f(1.35, 0.8, 0.95) },
  { start: "2026-12-23", end: "2027-01-18", label: "Winter Break", notice: "Winter Break — most students are away and hours may be reduced.", factor: f(0.2, 0.35, 0.2) },
  { start: "2027-02-15", end: "2027-02-15", label: "Presidents Day", notice: "Presidents Day — no classes today.", factor: f(0.75, 0.85, 0.8) },
  { start: "2027-03-13", end: "2027-03-21", label: "Spring Break", notice: "Spring Break — campus is quiet this week.", factor: f(0.3, 0.4, 0.3) },
  // Inferred, as above.
  { start: "2027-05-05", end: "2027-05-05", label: "Reading Day", notice: "Reading Day — expect study spaces to fill early.", factor: f(1.3, 0.8, 0.95) },
  { start: "2027-05-06", end: "2027-05-12", label: "Final Exams", notice: "Finals week — study spaces fill up fast. Go early.", factor: f(1.35, 0.8, 0.95) },
  { start: "2027-05-13", end: "2027-08-31", label: "Summer", notice: "Summer — campus is much quieter than during the semester.", factor: f(0.3, 0.45, 0.35) },
];

/** The calendar period covering a campus date, if any. ISO dates compare as strings. */
export function periodOn(dateKey: string): CalendarPeriod | undefined {
  return CALENDAR.find((p) => p.start <= dateKey && dateKey <= p.end);
}
