// Server-side helpers that wrap the provider into the JSON shapes the UI uses.
// Shared by the API routes (for polling) and the pages (for the first render).

import "server-only";
import type { OccupancyProvider, OccupancySnapshot, SpaceDetailSnapshot } from "@/lib/types";
import { getProvider } from "@/lib/providers";
import { SimulatedProvider } from "@/lib/providers/simulated-provider";
import { SPACES } from "@/config/spaces";

const MAX_PREVIEW_MS = 400 * 86_400_000;

/**
 * Parses the demo "preview time" (`?at=<epoch ms>`). Only honoured while the
 * data is simulated — a real provider can't show the future.
 */
export function parsePreviewAt(value: string | null): Date | undefined {
  if (!value || !getProvider().isSimulated) return undefined;
  const ms = Number(value);
  if (!Number.isFinite(ms) || Math.abs(ms - Date.now()) > MAX_PREVIEW_MS) return undefined;
  return new Date(ms);
}

function providerFor(at?: Date): OccupancyProvider {
  return at ? new SimulatedProvider({ spaces: SPACES, now: () => at }) : getProvider();
}

export async function getSnapshot(at?: Date): Promise<OccupancySnapshot> {
  const p = providerFor(at);
  const now = new Date().toISOString();
  return {
    provider: p.id,
    isSimulated: p.isSimulated,
    fetchedAt: now,
    asOf: at?.toISOString() ?? now,
    preview: !!at,
    spaces: await p.getCurrent(),
  };
}

export async function getSpaceDetail(spaceId: string, at?: Date): Promise<SpaceDetailSnapshot> {
  const [snapshot, today] = await Promise.all([getSnapshot(at), providerFor(at).getToday(spaceId)]);
  return { ...snapshot, spaces: snapshot.spaces.filter((s) => s.spaceId === spaceId), today };
}
