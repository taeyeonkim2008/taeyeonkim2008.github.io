"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OccupancySnapshot } from "@/lib/types";

export const REFRESH_MS = 30_000;

/**
 * Polls `url` every 30 s (and when the tab regains focus), starting from the
 * server-rendered `initial` snapshot. Works with any OccupancySnapshot-shaped
 * endpoint, so it doesn't care which provider is behind it.
 */
export function useOccupancy<T extends OccupancySnapshot>(url: string, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [updatedAt, setUpdatedAt] = useState(() => Date.parse(initial.fetchedAt));
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      setData((await res.json()) as T);
      setUpdatedAt(Date.now());
      setError(false);
    } catch {
      setError(true); // keep showing the last good data
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
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
  }, [refresh, updatedAt]);

  return { data, updatedAt, error, loading, refresh };
}
