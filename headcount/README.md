# Headcount

Live, floor-by-floor busyness for campus study spaces, gyms and dining halls. It's built for phones first.

Headcount currently runs on **realistic simulated data**. Real data can replace it by adding one class and setting one environment variable. The UI doesn't change.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4 · Vitest. No database.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests (simulation, busyness rules, API provider)
npm run lint       # type-check
npm run build      # production build
```

Requires Node 20+.

## Deploy to Vercel

1. Push this folder to GitHub. If it lives inside a larger repo, set **Root Directory** to `headcount` in the Vercel project settings.
2. Import the project in Vercel. It detects Next.js automatically, so you don't need any config.
3. Optional: set environment variables (see `.env.example`). With none set, the app uses simulated data.

Or from the CLI: `npx vercel` in this folder.

---

## Architecture

```
            ┌──────────────────────────── server ────────────────────────────┐
            │                                                                │
 spaces.ts ─┤   getProvider()  ──►  OccupancyProvider                        │
 (config)   │   (env switch)         ├─ SimulatedProvider  (now)             │
            │                        └─ ApiProvider        (later)           │
            │          │                                                     │
            │          ▼                                                     │
            │   snapshot.ts  ──►  /api/occupancy, /api/spaces/[id]           │
            │          │                     ▲                               │
            └──────────┼─────────────────────┼───────────────────────────────┘
                       │ first render        │ poll every 30 s
                       ▼                     │
              pages (server)  ──►  client views (useOccupancy hook)  ──►  UI
```

### The provider seam

Everything the UI knows about data is in `src/lib/types.ts`:

```ts
interface OccupancyProvider {
  readonly id: string;
  readonly isSimulated: boolean;               // drives the "Demo" badge
  getCurrent(): Promise<SpaceOccupancy[]>;     // per-floor { floorId, count, capacity, timestamp }
  getToday(spaceId: string): Promise<HourlyPoint[]>; // 24 × { hour, percent }
}
```

- `src/lib/providers/index.ts` is the **only** file that chooses an implementation. It reads `OCCUPANCY_PROVIDER`.
- Pages and API routes call `getProvider()` on the server, and the browser only ever sees the resulting JSON. A real provider's credentials therefore never reach the client.
- Client components (`HomeView`, `SpaceDetailView`) receive a server-rendered snapshot. They then poll the API routes every 30 s, pausing while the tab is hidden and refreshing when it becomes visible again.

### Swapping in real data

`src/lib/providers/api-provider.ts` is a ready-made template. It expects a backend that has **already aggregated** raw signals into one anonymous count per floor. Possible sources include Wi-Fi associations per access point, ID swipes in minus out, and door counters.

```
GET {OCCUPANCY_API_URL}/occupancy
  → { "readings": [ { "spaceId": "bobst", "floorId": "f2", "count": 87, "timestamp": "…" } ] }

GET {OCCUPANCY_API_URL}/spaces/{spaceId}/today      (optional — hides the chart if missing)
  → { "hours": [ { "hour": 0, "percent": 4 }, … ] }
```

To switch:

1. Make sure the `id`s in `src/config/spaces.ts` match the ids your backend uses. Capacities still come from the config.
2. Set `OCCUPANCY_PROVIDER=api`, `OCCUPANCY_API_URL=…` and, optionally, `OCCUPANCY_API_KEY=…`. Locally these go in `.env.local`; on Vercel, add them under Project Settings → Environment Variables.
3. If your API's shape differs, edit only `api-provider.ts`, or write a new class that implements `OccupancyProvider` and add a `case` for it in `providers/index.ts`.

The "Demo: simulated data" badge disappears automatically because `isSimulated` is `false`.

> **Mapping access points to floors.** If your raw data is per Wi-Fi AP, do the AP→floor sum in your backend, or add an `apIds` list to each floor in `spaces.ts` and sum inside the provider. Either way, only per-floor totals should reach Headcount. Devices are not people: phones, laptops and watches inflate counts, so calibrate with a per-floor `devicesPerPerson` factor.

### How the simulation works

The model lives in `src/lib/simulation/model.ts` and is tested in `model.test.ts`.

```
fullness = baseCurve(type, local hour − lag) ^ exponent × amplitude × dayFactor + noise
```

- **`baseCurve`** is a sum of Gaussian bumps on a 24-hour circle for each space type:
  - Study spaces peak midday and evening.
  - Gyms peak in the morning and around 6 pm.
  - Dining halls peak at breakfast, lunch and dinner.
  - Weekends use flatter, later curves. Study and dining are noticeably quieter.
- **Floor profiles** (`profile` in `spaces.ts`) shape each floor's curve:
  - `quiet` floors lag behind and fill slowly (exponent > 1).
  - `social` floors fill fast.
  - Gym areas (`cardio`, `weights`, `courts`) peak at different times.
  - Each floor also gets a small fixed personality from a hash of its id.
- **Noise** is smooth value noise over real time (two octaves, 20 min and 5 min). It is smaller when a space is near-empty.
- **Smoothness:** the "busy day" factor drifts gradually across days. Weekday and weekend curves are blended between 3 and 5 am rather than switched at midnight. A test checks that no floor moves more than 2 points between 30-second refreshes across a whole week.
- **Deterministic and stateless:** the same instant always gives the same number. Serverless instances therefore agree with each other, and the hourly chart always matches the live reading.

All times use campus time (`CAMPUS_TIME_ZONE` in `spaces.ts`).

### Busyness labels

| Label    | Range      |
| -------- | ---------- |
| Empty    | < 25%      |
| Moderate | 25–59%     |
| Busy     | 60–85%     |
| Packed   | > 85%      |

The thresholds are defined in `src/lib/busyness.ts`. Each color always appears together with its text label.

---

## File map

| Path | What it does |
| --- | --- |
| `src/config/spaces.ts` | **Edit me.** All spaces and floors (id, name, type, capacity, optional simulation profile) plus the campus time zone. Currently placeholders (see the `TODO`s). |
| `src/lib/types.ts` | Domain types and the `OccupancyProvider` interface. |
| `src/lib/providers/index.ts` | Picks the provider from `OCCUPANCY_PROVIDER`. |
| `src/lib/providers/simulated-provider.ts` | `OccupancyProvider` backed by the simulation. |
| `src/lib/providers/api-provider.ts` | Template provider for a real aggregate-count API. |
| `src/lib/simulation/model.ts` | Daily curves, floor profiles, noise, which together give fullness at an instant. |
| `src/lib/simulation/random.ts` | Deterministic hashing and smooth value noise. |
| `src/lib/time.ts` | Campus-time helpers (hour of day, weekend, hours of today). |
| `src/lib/busyness.ts` | Percentages, Empty/Moderate/Busy/Packed, best study spot. |
| `src/lib/snapshot.ts` | Wraps the provider into the JSON the UI consumes. |
| `src/lib/useOccupancy.ts` | Client hook: 30 s polling, visibility-aware, keeps last good data on error. |
| `src/app/api/occupancy/route.ts` | `GET` current occupancy for all spaces. |
| `src/app/api/spaces/[id]/route.ts` | `GET` one space plus today's hourly curve. |
| `src/app/page.tsx` → `components/HomeView.tsx` | Home: best-spot banner, filter tabs, cards grouped by type. |
| `src/app/spaces/[id]/page.tsx` → `components/SpaceDetailView.tsx` | Detail: per-floor bars, sort by least busy, hourly chart. |
| `src/app/about/page.tsx` | Privacy and how-it-works page. |
| `src/components/HourlyChart.tsx` | Today's 24-hour bar chart with tap-to-read and "quietest in the next 6 h". |
| `src/components/StatusBar.tsx` | Demo badge, "Updated X seconds ago", refresh button. |
| `src/components/Level.tsx` | Level pill and busyness bar. |
| `src/components/SpaceCard.tsx`, `BestSpotBanner.tsx`, `Header.tsx`, `Logo.tsx`, `TypeIcon.tsx` | Presentational pieces. |
| `src/app/globals.css` | Design tokens (light and dark) for Tailwind. |

## Privacy

Headcount is designed to handle **only anonymous, aggregate counts**. It has no user accounts, analytics or per-person data. Any real data source must aggregate before data reaches this app. The About page explains this to users.

## Branding

Headcount is an independent project with original branding. It does not use any university's name, logo or official colors.
