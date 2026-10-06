# Headcount

Live, floor-by-floor busyness for campus study spaces, gyms and dining halls. It's built for phones first.

Headcount currently runs on **realistic simulated data**. Real data can replace it by adding one class and setting one environment variable. The UI doesn't change.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4 · Vitest. No database.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests (simulation, hours, calendar, busyness rules, API provider)
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

The "Demo: simulated data" badge and the demo time picker disappear automatically because `isSimulated` is `false`. Opening hours and calendar notices keep working, since they come from config rather than the provider.

> **Mapping access points to floors.** If your raw data is per Wi-Fi AP, do the AP→floor sum in your backend, or add an `apIds` list to each floor in `spaces.ts` and sum inside the provider. Either way, only per-floor totals should reach Headcount. Devices are not people: phones, laptops and watches inflate counts, so calibrate with a per-floor `devicesPerPerson` factor.

### How the simulation works

The model lives in `src/lib/simulation/model.ts` and is tested in `model.test.ts`.

```
fullness = baseCurve(type, local hour − lag) ^ exponent × amplitude × dayFactor
           × calendarFactor × openFactor + noise
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
- **Opening hours** (`hours` in `spaces.ts`): a space reads exactly 0 while closed. It fills over the first 45 minutes after opening and empties over the last 30 minutes before closing.
- **Academic calendar** (`src/config/calendar.ts`): breaks, holidays and summer scale busyness down, and midterms, reading days and finals scale study spaces up. Each period has a multiplier per space type.
- **Noise** is smooth value noise over real time (two octaves, 20 min and 5 min). It is smaller when a space is near-empty.
- **Smoothness:** the "busy day" factor drifts gradually across days. Weekday/weekend curves and calendar multipliers are blended between 3 and 5 am rather than switched at midnight. Tests check that no floor moves more than 2 points between 30-second refreshes across a normal week, Thanksgiving week and the switch from finals to winter break.
- **Deterministic and stateless:** the same instant always gives the same number. Serverless instances therefore agree with each other, and the hourly chart always matches the live reading.

All times use campus time (`CAMPUS_TIME_ZONE` in `spaces.ts`).

### Where the config data comes from

Checked October 2026:

- **Bobst floors and quiet areas:** NYU Libraries' spaces pages and FAQ. Bobst is open 24 hours to NYU ID holders.
- **Gym hours:** NYU Athletics' Fall 2026 "Facilities Hours & Access" page, including Thanksgiving closures and 404 Fitness's Oct 7–9 repair closure.
- **Dining hall hours:** NYU's Fall 2026 Hours of Operation page for Downstein, Third North and Lipton.
- **Calendar:** NYU's 2026–27 academic calendar. Midterm season and reading days are marked as approximate or inferred.
- **Capacities are estimates.** NYU doesn't publish per-floor seat counts; Bobst's are scaled from the ~3,000 total seats reported by Washington Square News. Paulson Center study-area names and hours are also unverified. All of these are marked `TODO` in the config.

Hours change each semester, so recheck them at the start of every term.

### Demo mode

While data is simulated, a bar under the header shows the demo badge and a **Preview a time** picker. It lets you show the app at any day and hour of the current week, so a 9 am demo can still show the lunch rush, the 6 pm gym peak or everything closed at 2 am.
- The picker sends `?at=<epoch ms>` to the API routes, which build a `SimulatedProvider` pinned to that moment.
- Polling pauses while previewing.
- The choice survives page navigation and reloads within the tab.
- The server ignores `?at=` when a real provider is active, so the picker can't be used to fake real data.

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
| `src/config/spaces.ts` | **Edit me.** All spaces and floors (id, name, type, capacity, opening hours, optional simulation profile) plus the campus time zone. Capacities are estimates (see the `TODO`s). |
| `src/config/calendar.ts` | Academic-calendar periods: user-facing notices and simulation multipliers. |
| `src/lib/types.ts` | Domain types and the `OccupancyProvider` interface. |
| `src/lib/providers/index.ts` | Picks the provider from `OCCUPANCY_PROVIDER`. |
| `src/lib/providers/simulated-provider.ts` | `OccupancyProvider` backed by the simulation. |
| `src/lib/providers/api-provider.ts` | Template provider for a real aggregate-count API. |
| `src/lib/simulation/model.ts` | Daily curves, floor profiles, noise, which together give fullness at an instant. |
| `src/lib/simulation/random.ts` | Deterministic hashing and smooth value noise. |
| `src/lib/time.ts` | Campus-time helpers (hour of day, weekend, hours of today). |
| `src/lib/hours.ts` | Open/closed checks and labels like "Closes 10 PM" or "Opens tomorrow 7 AM". |
| `src/lib/demoClock.tsx` | Demo preview-time state, shared across pages. |
| `src/lib/busyness.ts` | Percentages, Empty/Moderate/Busy/Packed, best study spot. |
| `src/lib/snapshot.ts` | Wraps the provider into the JSON the UI consumes. |
| `src/lib/useOccupancy.ts` | Client hook: 30 s polling, visibility-aware, keeps last good data on error. |
| `src/app/api/occupancy/route.ts` | `GET` current occupancy for all spaces. |
| `src/app/api/spaces/[id]/route.ts` | `GET` one space plus today's hourly curve. |
| `src/app/page.tsx` → `components/HomeView.tsx` | Home: best-spot banner, filter tabs, cards grouped by type. |
| `src/app/spaces/[id]/page.tsx` → `components/SpaceDetailView.tsx` | Detail: per-floor bars, sort by least busy, hourly chart. |
| `src/app/about/page.tsx` | Privacy and how-it-works page. |
| `src/components/HourlyChart.tsx` | Today's 24-hour bar chart with tap-to-read and "quietest in the next 6 h". |
| `src/components/DemoBar.tsx` | Demo badge and the "Preview a time" picker (simulated data only). |
| `src/components/StatusBar.tsx` | "Updated X seconds ago" and refresh button, or the preview time. |
| `src/components/Level.tsx` | Level pill, Closed pill and busyness bar. |
| `src/components/SpaceCard.tsx`, `BestSpotBanner.tsx`, `Header.tsx`, `Logo.tsx`, `TypeIcon.tsx` | Presentational pieces. |
| `src/app/globals.css` | Design tokens (light and dark) for Tailwind. |

## Privacy

Headcount is designed to handle **only anonymous, aggregate counts**. It has no user accounts, analytics or per-person data. Any real data source must aggregate before data reaches this app. The About page explains this to users.

## Branding

Headcount is an independent project with original branding. It does not use any university's name, logo or official colors.
