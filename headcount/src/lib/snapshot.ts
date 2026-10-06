// Server-side helpers that wrap the provider into the JSON shapes the UI uses.
// Shared by the API routes (for polling) and the pages (for the first render).

import "server-only";
import type { OccupancySnapshot, SpaceDetailSnapshot } from "@/lib/types";
import { getProvider } from "@/lib/providers";

export async function getSnapshot(): Promise<OccupancySnapshot> {
  const p = getProvider();
  return {
    provider: p.id,
    isSimulated: p.isSimulated,
    fetchedAt: new Date().toISOString(),
    spaces: await p.getCurrent(),
  };
}

export async function getSpaceDetail(spaceId: string): Promise<SpaceDetailSnapshot> {
  const [snapshot, today] = await Promise.all([getSnapshot(), getProvider().getToday(spaceId)]);
  return { ...snapshot, spaces: snapshot.spaces.filter((s) => s.spaceId === spaceId), today };
}
