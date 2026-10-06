import Link from "next/link";
import type { BestSpot } from "@/lib/busyness";
import { LevelPill } from "./Level";

export default function BestSpotBanner({ spot }: { spot: BestSpot | null }) {
  if (!spot) return null;
  return (
    <Link
      href={`/spaces/${spot.space.id}?floor=${spot.floorId}`}
      className="block rounded-2xl bg-ink p-4 text-paper shadow-sm transition active:scale-[0.99]"
    >
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-paper/60">
        <svg className="size-3.5 text-accent" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2 14.6 8.6 21.5 9.2 16.2 13.7 17.9 20.5 12 16.8 6.1 20.5 7.8 13.7 2.5 9.2 9.4 8.6z" />
        </svg>
        Best spot right now
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-lg font-semibold">{spot.floorName}</div>
          <div className="truncate text-sm text-paper/70">{spot.space.name}</div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="text-2xl font-semibold tabular-nums leading-none">
            {spot.percent}
            <span className="text-sm text-paper/60">%</span>
          </div>
          <LevelPill percent={spot.percent} />
        </div>
      </div>
    </Link>
  );
}
