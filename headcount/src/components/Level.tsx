import { LEVEL_LABEL, levelFor, type BusynessLevel } from "@/lib/busyness";

export const levelColor = (l: BusynessLevel) => `var(--lvl-${l})`;
export const levelSoft = (l: BusynessLevel) => `var(--lvl-${l}-soft)`;

/** Colored pill with the level name — color is never the only signal. */
export function LevelPill({ percent, className = "" }: { percent: number; className?: string }) {
  const level = levelFor(percent);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
      style={{ background: levelSoft(level), color: levelColor(level) }}
    >
      <span className="size-1.5 rounded-full" style={{ background: levelColor(level) }} aria-hidden />
      {LEVEL_LABEL[level]}
    </span>
  );
}

export function BusyBar({ percent, size = "md" }: { percent: number; size?: "sm" | "md" }) {
  const level = levelFor(percent);
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-track ${size === "sm" ? "h-1.5" : "h-2.5"}`}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={`${percent}% full, ${LEVEL_LABEL[level]}`}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${Math.max(percent, 2)}%`, background: levelColor(level) }}
      />
    </div>
  );
}
