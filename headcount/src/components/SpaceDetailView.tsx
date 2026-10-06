"use client";

import { useState } from "react";
import Link from "next/link";
import type { SpaceConfig, SpaceDetailSnapshot } from "@/lib/types";
import { floorPercent, spacePercent } from "@/lib/busyness";
import { campusClock } from "@/lib/time";
import { useOccupancy } from "@/lib/useOccupancy";
import { BusyBar, LevelPill } from "./Level";
import StatusBar from "./StatusBar";
import HourlyChart from "./HourlyChart";
import TypeIcon, { TYPE_LABEL } from "./TypeIcon";

type Sort = "floor" | "least";

export default function SpaceDetailView({
  space,
  initial,
  highlightFloor,
}: {
  space: SpaceConfig;
  initial: SpaceDetailSnapshot;
  highlightFloor?: string;
}) {
  const { data, updatedAt, loading, error, refresh } = useOccupancy(`/api/spaces/${space.id}`, initial);
  const [sort, setSort] = useState<Sort>("floor");

  const occ = data.spaces[0];
  const overall = occ && occ.floors.length ? spacePercent(occ) : null;
  const currentHour = Math.floor(campusClock(new Date(data.fetchedAt)).hour);

  const rows = space.floors.map((floor, order) => {
    const reading = occ?.floors.find((f) => f.floorId === floor.id);
    return { floor, order, reading, percent: reading ? floorPercent(reading) : null };
  });
  if (sort === "least") rows.sort((a, b) => (a.percent ?? 101) - (b.percent ?? 101) || a.order - b.order);

  return (
    <>
      <Link href="/" className="-ml-2 mt-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm text-ink-2 hover:bg-track">
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All spaces
      </Link>

      <div className="mt-2 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-ink-3">
            <TypeIcon type={space.type} className="size-3.5" />
            {TYPE_LABEL[space.type]}
            {space.subtitle && <> · {space.subtitle}</>}
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{space.name}</h1>
        </div>
        {overall !== null && (
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <div className="text-4xl font-semibold tabular-nums leading-none">
              {overall}
              <span className="text-lg text-ink-3">%</span>
            </div>
            <LevelPill percent={overall} />
          </div>
        )}
      </div>

      <StatusBar isSimulated={data.isSimulated} updatedAt={updatedAt} loading={loading} error={error} onRefresh={refresh} />

      <section className="overflow-hidden rounded-2xl border border-line bg-card">
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
          <h2 className="font-semibold">{space.floors.length === 1 ? "Area" : "By floor"}</h2>
          {space.floors.length > 1 && (
            <div className="flex rounded-full bg-track p-0.5 text-xs font-medium" role="group" aria-label="Sort floors">
              {(["floor", "least"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  aria-pressed={sort === s}
                  className={`rounded-full px-3 py-1 transition ${sort === s ? "bg-card text-ink shadow-sm" : "text-ink-2"}`}
                >
                  {s === "floor" ? "Floor order" : "Least busy"}
                </button>
              ))}
            </div>
          )}
        </div>
        <ul className="divide-y divide-line">
          {rows.map(({ floor, reading, percent }) => (
            <li
              key={floor.id}
              className={`px-4 py-3.5 ${floor.id === highlightFloor ? "bg-accent-soft" : ""}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{floor.name}</div>
                  <div className="text-xs tabular-nums text-ink-3">
                    {reading ? `~${reading.count} of ${floor.capacity}` : "No data"}
                  </div>
                </div>
                {percent !== null && (
                  <div className="flex shrink-0 items-center gap-2.5">
                    <LevelPill percent={percent} />
                    <span className="w-10 text-right text-lg font-semibold tabular-nums">{percent}%</span>
                  </div>
                )}
              </div>
              <div className="mt-2.5">
                <BusyBar percent={percent ?? 0} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {data.today.length > 0 && (
        <section className="mt-4 rounded-2xl border border-line bg-card p-4">
          <HourlyChart points={data.today} currentHour={currentHour} />
        </section>
      )}
    </>
  );
}
