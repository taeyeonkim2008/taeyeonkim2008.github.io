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
    return hoursOfCampusDay(this.now()).map((at, hour) => ({
      hour,
      percent: spacePercent(this.snapshot(space, at)),
    }));
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
