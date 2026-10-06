// Template for a real data source. Enable it with OCCUPANCY_PROVIDER=api.
//
// It expects a backend that already aggregates raw signals (Wi-Fi association
// counts per access point, ID swipes in minus out, door counters…) into ONE
// anonymous number per floor. Headcount never receives anything about
// individuals — only these counts.
//
// Expected endpoints (adapt `parse*` below if yours differ):
//
//   GET {OCCUPANCY_API_URL}/occupancy
//     → { "readings": [ { "spaceId": "bobst", "floorId": "f2", "count": 87, "timestamp": "2026-10-05T14:03:00Z" }, … ] }
//
//   GET {OCCUPANCY_API_URL}/spaces/{spaceId}/today        (optional)
//     → { "hours": [ { "hour": 0, "percent": 4 }, …, { "hour": 23, "percent": 12 } ] }
//
// Capacities come from src/config/spaces.ts, and readings are matched to floors
// by `spaceId` + `floorId`, so those ids must line up with the config.

import type { HourlyPoint, OccupancyProvider, SpaceConfig, SpaceOccupancy } from "@/lib/types";

export interface ApiProviderOptions {
  spaces: SpaceConfig[];
  baseUrl: string;
  apiKey?: string;
}

interface RawReading {
  spaceId: string;
  floorId: string;
  count: number;
  timestamp: string;
}

export class ApiProvider implements OccupancyProvider {
  readonly id = "api";
  readonly isSimulated = false;

  constructor(private readonly opts: ApiProviderOptions) {}

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.opts.baseUrl.replace(/\/$/, "")}${path}`, {
      headers: this.opts.apiKey ? { Authorization: `Bearer ${this.opts.apiKey}` } : {},
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Occupancy API ${path} → HTTP ${res.status}`);
    return (await res.json()) as T;
  }

  async getCurrent(): Promise<SpaceOccupancy[]> {
    const { readings } = await this.get<{ readings: RawReading[] }>("/occupancy");
    const now = new Date().toISOString();
    return this.opts.spaces.map((space) => {
      const floors = space.floors.flatMap((floor) => {
        const r = readings.find((x) => x.spaceId === space.id && x.floorId === floor.id);
        // Floors without a reading are omitted; the UI shows them as "no data".
        return r ? [{ floorId: floor.id, count: Math.max(0, r.count), capacity: floor.capacity, timestamp: r.timestamp }] : [];
      });
      const latest = floors.map((f) => f.timestamp).sort().at(-1) ?? now;
      return { spaceId: space.id, floors, timestamp: latest };
    });
  }

  async getToday(spaceId: string): Promise<HourlyPoint[]> {
    try {
      const { hours } = await this.get<{ hours: HourlyPoint[] }>(`/spaces/${encodeURIComponent(spaceId)}/today`);
      return hours;
    } catch {
      return []; // the chart hides itself when there's no history
    }
  }
}
