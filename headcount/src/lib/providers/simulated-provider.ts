import type { HourlyPoint, OccupancyProvider, SpaceConfig, SpaceOccupancy } from "@/lib/types";
import { simulateFloorCount } from "@/lib/simulation/model";
import { hoursOfCampusDay } from "@/lib/time";
import { spacePercent } from "@/lib/busyness";

export interface SimulatedProviderOptions {
  spaces: SpaceConfig[];
  /** Injectable clock, for tests. */
  now?: () => Date;
}

/** Realistic fake data. See src/lib/simulation/model.ts for how it's shaped. */
export class SimulatedProvider implements OccupancyProvider {
  readonly id = "simulated";
  readonly isSimulated = true;
  private readonly spaces: SpaceConfig[];
  private readonly now: () => Date;

  constructor({ spaces, now = () => new Date() }: SimulatedProviderOptions) {
    this.spaces = spaces;
    this.now = now;
  }

  async getCurrent(): Promise<SpaceOccupancy[]> {
    return this.spaces.map((s) => this.snapshot(s, this.now()));
  }

  async getToday(spaceId: string): Promise<HourlyPoint[]> {
    const space = this.spaces.find((s) => s.id === spaceId);
    if (!space) throw new Error(`Unknown space: ${spaceId}`);
    // Average three samples per hour so short openings (e.g. a dining hall's
    // 10:00–10:30 breakfast tail) still show up in the bar.
    return hoursOfCampusDay(this.now()).map((mid, hour) => {
      const samples = [-20, 0, 20].map((min) => spacePercent(this.snapshot(space, new Date(mid.getTime() + min * 60_000))));
      return { hour, percent: Math.round(samples.reduce((a, b) => a + b, 0) / samples.length) };
    });
  }

  private snapshot(space: SpaceConfig, at: Date): SpaceOccupancy {
    const timestamp = at.toISOString();
    return {
      spaceId: space.id,
      timestamp,
      floors: space.floors.map((f) => ({
        floorId: f.id,
        count: simulateFloorCount(space, f, at),
        capacity: f.capacity,
        timestamp,
      })),
    };
  }
}
