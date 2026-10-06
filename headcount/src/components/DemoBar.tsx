"use client";

import { useEffect, useRef, useState } from "react";
import { mondayIndex, previewTime, useDemoClock } from "@/lib/demoClock";
import { campusClock } from "@/lib/time";
import { formatClock } from "@/lib/hours";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PRESETS: { label: string; day?: number; hour: number }[] = [
  { label: "Lunch rush", hour: 12 },
  { label: "Gym rush", hour: 18 },
  { label: "Late night", hour: 2 },
  { label: "Saturday", day: 5, hour: 14 },
];

export function formatPreview(at: number | string): string {
  const c = campusClock(new Date(at));
  return `${DAYS[mondayIndex(c.dayOfWeek)]} ${formatClock(Math.floor(c.hour * 60))}`;
}

/** Visible on every page while data is simulated: the demo badge and a time picker. */
export default function DemoBar() {
  const { enabled, previewAt, setPreviewAt } = useDemoClock();
  const [open, setOpen] = useState(false);

  const current = campusClock(previewAt ? new Date(previewAt) : new Date());
  const [day, setDay] = useState(mondayIndex(current.dayOfWeek));
  const [hour, setHour] = useState(Math.floor(current.hour));
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => setToday(mondayIndex(campusClock(new Date()).dayOfWeek)), []);

  // Sync the controls when the preview changes elsewhere (e.g. restored from storage).
  useEffect(() => {
    if (!previewAt) return;
    const c = campusClock(new Date(previewAt));
    setDay(mondayIndex(c.dayOfWeek));
    setHour(Math.floor(c.hour));
  }, [previewAt]);

  // Debounce slider drags so we don't fire a request per pixel.
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const commit = (d: number, h: number, delay = 0) => {
    setDay(d);
    setHour(h);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPreviewAt(previewTime(d, h)), delay);
  };

  if (!enabled) return null;

  return (
    <div className="border-b border-line bg-card/70">
      <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-2 text-[11px]">
        <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-ink-3/60 px-2 py-0.5 font-medium text-ink-2">
          <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M6 2h4M7 2v4L3 13a1 1 0 0 0 .9 1.5h8.2A1 1 0 0 0 13 13L9 6V2" strokeLinejoin="round" />
          </svg>
          Demo: simulated data
        </span>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={`ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium transition ${
            previewAt ? "bg-accent text-white" : "text-accent hover:bg-accent-soft"
          }`}
        >
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          {previewAt ? formatPreview(previewAt) : "Preview a time"}
          <svg className={`size-3 transition ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="mx-auto max-w-2xl px-4 pb-3">
          <div className="rounded-2xl border border-line bg-card p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold">Show the app at…</p>
              {previewAt && (
                <button onClick={() => setPreviewAt(null)} className="text-xs font-medium text-accent">
                  Back to now
                </button>
              )}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1" role="group" aria-label="Day">
              {DAYS.map((d, i) => (
                <button
                  key={d}
                  onClick={() => commit(i, hour)}
                  aria-pressed={previewAt !== null && day === i}
                  className={`relative rounded-lg py-1.5 text-xs font-medium transition ${
                    previewAt !== null && day === i ? "bg-ink text-paper" : "bg-track text-ink-2 hover:text-ink"
                  }`}
                >
                  {d}
                  {today === i && <span className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-accent" aria-label="today" />}
                </button>
              ))}
            </div>

            <label className="mt-3 flex items-center gap-3 text-xs">
              <span className="w-12 font-semibold tabular-nums">{formatClock(hour * 60)}</span>
              <input
                type="range"
                min={0}
                max={23}
                value={hour}
                onChange={(e) => commit(day, Number(e.target.value), 150)}
                className="w-full accent-[var(--accent)]"
                aria-label="Hour"
              />
            </label>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => commit(p.day ?? today ?? day, p.hour)}
                  className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-[11px] leading-snug text-ink-3">
              Demo only — disappears once real data is connected.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
