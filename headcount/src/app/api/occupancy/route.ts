import { NextResponse } from "next/server";
import { getSnapshot, parsePreviewAt } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

/** Current per-floor occupancy for every space. Polled by the client every 30 s. */
export async function GET(req: Request) {
  const at = parsePreviewAt(new URL(req.url).searchParams.get("at"));
  return NextResponse.json(await getSnapshot(at), { headers: { "Cache-Control": "no-store" } });
}
