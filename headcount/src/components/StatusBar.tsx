"use client";

import { useEffect, useState } from "react";

function ago(seconds: number): string {
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds} seconds ago`;
  const m = Math.floor(seconds / 60);
  return m === 1 ? "1 minute ago" : `${m} minutes ago`;
}

/** "Demo" badge + "Updated X seconds ago" + manual refresh. */
export default function StatusBar({
  isSimulated,
  updatedAt,
  loading,
  error,
  onRefresh,
}: {
  isSimulated: boolean;
  updatedAt: number;
  loading: boolean;
  error: boolean;
  onRefresh: () => void;
}) {
  // Render a stable value on the server, then tick every second on the client.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const seconds = now === null ? 0 : Math.max(0, Math.round((now - updatedAt) / 1000));

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 py-3 text-[11px] text-ink-3">
      {isSimulated && (
        <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-ink-3/60 px-2 py-0.5 font-medium text-ink-2">
          <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M6 2h4M7 2v4L3 13a1 1 0 0 0 .9 1.5h8.2A1 1 0 0 0 13 13L9 6V2" strokeLinejoin="round" />
          </svg>
          Demo: simulated data
        </span>
      )}
      <span className="ml-auto inline-flex items-center gap-1 whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <span className={`size-1.5 rounded-full ${error ? "bg-[var(--lvl-packed)]" : "bg-[var(--lvl-empty)] animate-pulse"}`} aria-hidden />
          {error ? "Can't reach server · " : ""}Updated {ago(seconds)}
        </span>
        <button
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh now"
          title="Refresh now"
          className="-mr-1.5 grid size-7 place-items-center rounded-full text-accent hover:bg-accent-soft disabled:opacity-50"
        >
          <svg className={`size-4 ${loading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" />
          </svg>
        </button>
      </span>
    </div>
  );
}
