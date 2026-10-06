"use client";

import { useState } from "react";
import type { HourlyPoint } from "@/lib/types";
import { LEVEL_LABEL, levelFor } from "@/lib/busyness";
import { formatHour } from "@/lib/time";

const LOOKAHEAD_HOURS = 6;

/**
 * Today's busyness by hour. Hours up to now are solid; the rest of the day is
 * the expected curve, drawn lighter. Closed hours get a flat tick. Tap or hover
 * a bar to read its value.
 */
export default function HourlyChart({
  points,
  currentHour,
  openHours,
}: {
  points: HourlyPoint[];
  currentHour: number;
  /** openHours[h] is false when the space is closed for that hour. */
  openHours: boolean[];
}) {
  const [selected, setSelected] = useState<number | null>(null);
  if (points.length === 0) return null;

  const isClosed = (h: number) => openHours[h] === false;
  const shown = points.find((p) => p.hour === (selected ?? currentHour)) ?? points[0];
  const upcoming = points.filter(
    (p) => p.hour > currentHour && p.hour <= currentHour + LOOKAHEAD_HOURS && !isClosed(p.hour),
  );
  const quietest = upcoming.length ? upcoming.reduce((a, b) => (b.percent < a.percent ? b : a)) : null;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-semibold">Today</h2>
        {/* Readout doubles as the tooltip, so it never clips off a phone screen */}
        <p className="text-sm tabular-nums text-ink-2" aria-live="polite">
          <span className="font-medium text-ink">
            {shown.hour === currentHour ? "Now" : formatHour(shown.hour)}
          </span>
          {" · "}
          {isClosed(shown.hour) ? (
            "Closed"
          ) : (
            <>
              {shown.percent}% · {LEVEL_LABEL[levelFor(shown.percent)]}
              {shown.hour > currentHour && <span className="text-ink-3"> (expected)</span>}
            </>
          )}
        </p>
      </div>

      <div className="relative mt-3 h-36" onMouseLeave={() => setSelected(null)}>
        {/* Recessive grid at 50% and 100% */}
        {[100, 50].map((g) => (
          <div key={g} className="pointer-events-none absolute inset-x-0 border-t border-dashed border-line" style={{ bottom: `${g}%` }}>
            <span className="absolute -top-2 right-0 bg-card pl-1 text-[10px] leading-none text-ink-3">{g}%</span>
          </div>
        ))}
        <div className="absolute inset-0 right-7 flex items-end gap-[2px]">
          {points.map((p) => {
            const past = p.hour < currentHour;
            const isNow = p.hour === currentHour;
            const active = p.hour === shown.hour;
            const closed = isClosed(p.hour);
            return (
              <button
                key={p.hour}
                type="button"
                className="relative flex h-full flex-1 items-end justify-center focus:outline-none"
                onMouseEnter={() => setSelected(p.hour)}
                onFocus={() => setSelected(p.hour)}
                onClick={() => setSelected(p.hour)}
                aria-label={
                  closed
                    ? `${formatHour(p.hour)}: closed`
                    : `${formatHour(p.hour)}: ${p.percent}% ${LEVEL_LABEL[levelFor(p.percent)]}${p.hour > currentHour ? ", expected" : ""}`
                }
              >
                {closed ? (
                  <span
                    className="h-[3px] w-full max-w-4 rounded-full bg-line"
                    style={{ outline: active ? "2px solid var(--ink)" : undefined, outlineOffset: active ? "2px" : undefined }}
                  />
                ) : (
                  <span
                    className="w-full max-w-4 rounded-t-[4px] transition-[height,opacity] duration-500"
                    style={{
                      height: `${Math.max(p.percent, 1.5)}%`,
                      background: "var(--accent)",
                      opacity: isNow ? 1 : past ? 0.55 : 0.22,
                      outline: active ? "2px solid var(--ink)" : undefined,
                      outlineOffset: active ? "1px" : undefined,
                    }}
                  />
                )}
                {isNow && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 -translate-y-full rounded bg-ink px-1 text-[9px] font-semibold leading-tight text-paper">
                    NOW
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mr-7 mt-1.5 flex text-[10px] text-ink-3" aria-hidden>
        {points.map((p) => (
          <span key={p.hour} className="flex-1 text-center">
            {p.hour % 6 === 0 ? formatHour(p.hour) : ""}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-3">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-accent opacity-55" aria-hidden /> Earlier today
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-accent opacity-25" aria-hidden /> Expected
        </span>
        {openHours.some((o) => !o) && (
          <span className="flex items-center gap-1.5">
            <span className="h-[3px] w-2.5 rounded-full bg-line" aria-hidden /> Closed
          </span>
        )}
      </div>

      {quietest && (
        <p className="mt-3 rounded-xl bg-accent-soft px-3 py-2 text-sm text-ink">
          Quietest in the next {LOOKAHEAD_HOURS} hours: <strong>{formatHour(quietest.hour)}</strong>{" "}
          <span className="text-ink-2">(~{quietest.percent}%)</span>
        </p>
      )}

      <table className="sr-only">
        <caption>Busyness by hour today</caption>
        <tbody>
          {points.map((p) => (
            <tr key={p.hour}>
              <th scope="row">{formatHour(p.hour)}</th>
              <td>{isClosed(p.hour) ? "Closed" : `${p.percent}%`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
