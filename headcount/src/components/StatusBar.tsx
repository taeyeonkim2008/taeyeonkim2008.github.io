"use client";

import { useEffect, useState } from "react";
import { formatPreview } from "./DemoBar";

function ago(seconds: number): string {
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds} seconds ago`;
  const m = Math.floor(seconds / 60);
  return m === 1 ? "1 minute ago" : `${m} minutes ago`;
}

/** "Updated X seconds ago" + manual refresh — or the demo preview time. */
export default function StatusBar({
  updatedAt,
  previewAsOf,
  loading,
  error,
  onRefresh,
}: {
  updatedAt: number;
  /** Set while showing a demo preview time. */
  previewAsOf?: string;
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

  if (previewAsOf) {
    return (
      <div className="flex items-center gap-1.5 py-3 text-[11px] text-ink-3">
        <span className="size-1.5 rounded-full bg-accent" aria-hidden />
        Showing {formatPreview(previewAsOf)} · demo preview
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1 py-3 text-[11px] text-ink-3">
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
    </div>
  );
}
