import Link from "next/link";
import type { SpaceConfig, SpaceOccupancy } from "@/lib/types";
import { floorPercent, spacePercent } from "@/lib/busyness";
import { BusyBar, LevelPill, levelColor } from "./Level";
import { levelFor } from "@/lib/busyness";
import TypeIcon from "./TypeIcon";

export default function SpaceCard({ space, occupancy }: { space: SpaceConfig; occupancy?: SpaceOccupancy }) {
  const hasData = !!occupancy && occupancy.floors.length > 0;
  const percent = hasData ? spacePercent(occupancy) : 0;

  return (
    <Link
      href={`/spaces/${space.id}`}
      className="group block rounded-2xl border border-line bg-card p-4 transition hover:border-ink-3/40 hover:shadow-sm active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-ink-3">
            <TypeIcon type={space.type} className="size-3.5" />
            <span className="truncate text-xs">{space.subtitle}</span>
          </div>
          <h3 className="mt-0.5 truncate font-semibold">{space.name}</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums leading-none">
            {hasData ? percent : "—"}
            {hasData && <span className="text-sm font-medium text-ink-3">%</span>}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        {hasData ? <LevelPill percent={percent} /> : <span className="text-xs text-ink-3">No data</span>}
        {/* Mini floor strip: one tick per floor, so you can spot a quiet floor at a glance */}
        {hasData && occupancy.floors.length > 1 && (
          <div className="flex items-end gap-0.5" aria-hidden>
            {occupancy.floors.map((f) => {
              const p = floorPercent(f);
              return (
                <span key={f.floorId} className="relative h-5 w-1.5 overflow-hidden rounded-sm bg-track">
                  <span
                    className="absolute inset-x-0 bottom-0 rounded-sm transition-[height] duration-700"
                    style={{ height: `${Math.max(p, 8)}%`, background: levelColor(levelFor(p)) }}
                  />
                </span>
              );
            })}
          </div>
        )}
      </div>
      <div className="mt-3">
        <BusyBar percent={percent} size="sm" />
      </div>
    </Link>
  );
}
