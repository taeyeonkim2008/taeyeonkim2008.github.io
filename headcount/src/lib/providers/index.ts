// The ONE place that decides where occupancy data comes from.
// Server-side only: API routes and server components call getProvider().

import "server-only";
import type { OccupancyProvider } from "@/lib/types";
import { SPACES } from "@/config/spaces";
import { SimulatedProvider } from "./simulated-provider";
import { ApiProvider } from "./api-provider";

let provider: OccupancyProvider | undefined;

export function getProvider(): OccupancyProvider {
  if (provider) return provider;
  const kind = process.env.OCCUPANCY_PROVIDER ?? "simulated";
  switch (kind) {
    case "api": {
      const baseUrl = process.env.OCCUPANCY_API_URL;
      if (!baseUrl) throw new Error("OCCUPANCY_PROVIDER=api requires OCCUPANCY_API_URL");
      provider = new ApiProvider({ spaces: SPACES, baseUrl, apiKey: process.env.OCCUPANCY_API_KEY });
      break;
    }
    case "simulated":
      provider = new SimulatedProvider({ spaces: SPACES });
      break;
    default:
      throw new Error(`Unknown OCCUPANCY_PROVIDER "${kind}" (expected "simulated" or "api")`);
  }
  return provider;
}
