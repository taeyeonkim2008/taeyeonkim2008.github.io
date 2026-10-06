"use client";

// Demo-only "preview time": lets you show the app at a busy Tuesday afternoon
// even if you're demoing at 9 am. Enabled only while data is simulated; with a
// real provider `previewAt` is always null and nothing here does anything.

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { campusClock } from "@/lib/time";

const STORAGE_KEY = "headcount:previewAt";

interface DemoClock {
  enabled: boolean;
  /** Epoch ms being previewed, or null for "now". */
  previewAt: number | null;
  setPreviewAt: (at: number | null) => void;
}

const DemoClockContext = createContext<DemoClock>({ enabled: false, previewAt: null, setPreviewAt: () => {} });

export function DemoClockProvider({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  const [previewAt, setState] = useState<number | null>(null);

  // Restore across reloads within the tab (handy mid-demo); ignore if storage is blocked.
  useEffect(() => {
    if (!enabled) return;
    try {
      const v = Number(sessionStorage.getItem(STORAGE_KEY));
      if (v) setState(v);
    } catch {}
  }, [enabled]);

  const setPreviewAt = useCallback((at: number | null) => {
    setState(at);
    try {
      if (at) sessionStorage.setItem(STORAGE_KEY, String(at));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return (
    <DemoClockContext.Provider value={{ enabled, previewAt: enabled ? previewAt : null, setPreviewAt }}>
      {children}
    </DemoClockContext.Provider>
  );
}

export const useDemoClock = () => useContext(DemoClockContext);

/** 0 = Monday … 6 = Sunday. */
export const mondayIndex = (dayOfWeek: number) => (dayOfWeek + 6) % 7;

/** Epoch ms for `hour`:30 on the given weekday of the current campus week. */
export function previewTime(dayIdx: number, hour: number, now = new Date()): number {
  const c = campusClock(now);
  return now.getTime() + (dayIdx - mondayIndex(c.dayOfWeek)) * 86_400_000 + (hour + 0.5 - c.hour) * 3_600_000;
}
