"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OccupancySnapshot } from "@/lib/types";
import { useDemoClock } from "@/lib/demoClock";

export const REFRESH_MS = 30_000;

/**
 * Polls `url` every 30 s (and when the tab regains focus), starting from the
 * server-rendered `initial` snapshot. Works with any OccupancySnapshot-shaped
 * endpoint, so it doesn't care which provider is behind it. While a demo
 * preview time is set, it fetches that moment instead and stops polling.
 */
export function useOccupancy<T extends OccupancySnapshot>(url: string, initial: T) {
  const { previewAt } = useDemoClock();
  const target = previewAt ? `${url}?at=${previewAt}` : url;

  const [data, setData] = useState<T>(initial);
  const [updatedAt, setUpdatedAt] = useState(() => Date.parse(initial.fetchedAt));
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  // Only the newest request may update state, so a slow response can't
  // overwrite a newer preview time.
  const latest = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++latest.current;
    setLoading(true);
    try {
      const res = await fetch(target, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as T;
      if (id !== latest.current) return;
      setData(json);
      setUpdatedAt(Date.now());
      setError(false);
    } catch {
      if (id === latest.current) setError(true); // keep showing the last good data
    } finally {
      if (id === latest.current) setLoading(false);
    }
  }, [target]);

  // Refetch when entering/leaving a preview. The first render already has
  // server data for "now", so skip it unless we start in a preview.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      if (!previewAt) return;
    }
    refresh();
  }, [target]);

  useEffect(() => {
    if (previewAt) return; // a preview is a frozen moment
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - updatedAt > REFRESH_MS) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh, updatedAt, previewAt]);

  return { data, updatedAt, error, loading, refresh };
}
