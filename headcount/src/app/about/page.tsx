import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import { getProvider } from "@/lib/providers";

export const metadata: Metadata = { title: "About" };
export const dynamic = "force-dynamic";

const POINTS = [
  {
    title: "Counts, not people",
    body: "Headcount only ever sees a single number per floor — roughly how many people (or connected devices) are there right now. That's it.",
  },
  {
    title: "Anonymous and aggregate",
    body: "No names, IDs, device addresses, photos or locations of individuals are collected, stored or shown. Numbers are combined before they reach us.",
  },
  {
    title: "No tracking",
    body: "We never follow anyone from place to place or build a history of where a person has been. There are no accounts and no ad trackers.",
  },
  {
    title: "Estimates, not guarantees",
    body: "Busyness is an estimate. Treat it like a weather forecast: good for deciding where to head, not a promise of a free seat.",
  },
];

export default function AboutPage() {
  const simulated = getProvider().isSimulated;
  return (
    <article className="py-6">
      <div className="flex items-center gap-3">
        <Logo size={36} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">About Headcount</h1>
          <p className="text-sm text-ink-2">Find a less crowded spot, faster.</p>
        </div>
      </div>

      <p className="mt-5 leading-relaxed text-ink-2">
        Headcount shows how busy campus study spaces, gyms and dining halls are right now — floor by floor — plus how
        busy they tend to be through the day, so you can pick the quietest place or the best time to go.
      </p>

      {simulated && (
        <div className="mt-5 rounded-2xl border border-dashed border-ink-3/60 p-4 text-sm leading-relaxed text-ink-2">
          <strong className="text-ink">This is a demo.</strong> Busyness numbers are currently <em>simulated</em> from
          typical patterns — quiet mornings, busy middays and evenings, calmer weekends, quieter breaks and busier finals.
          They are not real measurements. Opening hours, floors and the academic calendar are taken from NYU&apos;s
          published information.
        </div>
      )}

      <h2 className="mt-8 text-lg font-semibold">Privacy by design</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {POINTS.map((p) => (
          <li key={p.title} className="rounded-2xl border border-line bg-card p-4">
            <h3 className="font-semibold">{p.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-2">{p.body}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-lg font-semibold">How the labels work</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">
        Busyness is the estimated count divided by the space&apos;s seating or safe capacity.{" "}
        <strong className="text-ink">Empty</strong> is under 25%, <strong className="text-ink">Moderate</strong> 25–59%,{" "}
        <strong className="text-ink">Busy</strong> 60–85%, and <strong className="text-ink">Packed</strong> above 85%.
        Spaces outside their opening hours show as <strong className="text-ink">Closed</strong>. Numbers refresh every
        30 seconds.
      </p>

      <p className="mt-8 text-xs text-ink-3">
        Headcount is an independent student project and is not affiliated with or endorsed by any university.
      </p>

      <Link href="/" className="mt-6 inline-block rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper">
        See what&apos;s busy
      </Link>
    </article>
  );
}
