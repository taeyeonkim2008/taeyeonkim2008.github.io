"use client";

import { useState } from "react";
import type { OccupancySnapshot, SpaceConfig, SpaceType } from "@/lib/types";
import { bestStudySpot } from "@/lib/busyness";
import { isOpen } from "@/lib/hours";
import { campusClock } from "@/lib/time";
import { periodOn } from "@/config/calendar";
import { useOccupancy } from "@/lib/useOccupancy";
import StatusBar from "./StatusBar";
import BestSpotBanner from "./BestSpotBanner";
import SpaceCard from "./SpaceCard";
import TypeIcon, { TYPE_HEADING, TYPE_LABEL } from "./TypeIcon";

type Filter = "all" | SpaceType;
const FILTERS: Filter[] = ["all", "study", "gym", "dining"];
const TYPE_ORDER: SpaceType[] = ["study", "gym", "dining"];

export default function HomeView({ spaces, initial }: { spaces: SpaceConfig[]; initial: OccupancySnapshot }) {
  const { data, updatedAt, loading, error, refresh } = useOccupancy("/api/occupancy", initial);
  const [filter, setFilter] = useState<Filter>("all");

  const at = new Date(data.asOf);
  const best = bestStudySpot(
    spaces.filter((s) => isOpen(s, at)),
    data.spaces,
  );
  const notice = periodOn(campusClock(at).dateKey)?.notice;
  const groups = TYPE_ORDER.filter((t) => filter === "all" || filter === t)
    .map((type) => ({ type, items: spaces.filter((s) => s.type === type) }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <StatusBar
        updatedAt={updatedAt}
        previewAsOf={data.preview ? data.asOf : undefined}
        loading={loading}
        error={error}
        onRefresh={refresh}
      />

      <h1 className="sr-only">Campus busyness</h1>

      {notice && (
        <p className="mb-3 flex items-start gap-2 rounded-2xl border border-line bg-card px-3.5 py-2.5 text-sm text-ink-2">
          <svg className="mt-0.5 size-4 shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          {notice}
        </p>
      )}

      {(filter === "all" || filter === "study") && best && (
        <div className="mb-4">
          <BestSpotBanner spot={best} />
        </div>
      )}

      <div role="tablist" aria-label="Filter by type" className="sticky top-14 z-[5] -mx-4 mb-2 flex gap-1.5 overflow-x-auto bg-paper/85 px-4 py-2 backdrop-blur">
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <button
              key={f}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                active ? "bg-ink text-paper" : "bg-card text-ink-2 ring-1 ring-line hover:text-ink"
              }`}
            >
              {f !== "all" && <TypeIcon type={f} className="size-3.5" />}
              {f === "all" ? "All" : TYPE_LABEL[f]}
            </button>
          );
        })}
      </div>

      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g.type}>
            <h2 className="mb-2 text-sm font-semibold text-ink-2">{TYPE_HEADING[g.type]}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {g.items.map((s) => (
                <SpaceCard key={s.id} space={s} at={at} occupancy={data.spaces.find((o) => o.spaceId === s.id)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
