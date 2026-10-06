"use client";

import { useState } from "react";
import type { OccupancySnapshot, SpaceConfig, SpaceType } from "@/lib/types";
import { bestStudySpot } from "@/lib/busyness";
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

  const best = bestStudySpot(spaces, data.spaces);
  const groups = TYPE_ORDER.filter((t) => filter === "all" || filter === t)
    .map((type) => ({ type, items: spaces.filter((s) => s.type === type) }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <StatusBar isSimulated={data.isSimulated} updatedAt={updatedAt} loading={loading} error={error} onRefresh={refresh} />

      <h1 className="sr-only">Campus busyness</h1>

      {(filter === "all" || filter === "study") && (
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
                <SpaceCard key={s.id} space={s} occupancy={data.spaces.find((o) => o.spaceId === s.id)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
