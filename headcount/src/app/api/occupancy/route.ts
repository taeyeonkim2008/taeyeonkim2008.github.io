import { NextResponse } from "next/server";
import { getSnapshot } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

/** Current per-floor occupancy for every space. Polled by the client every 30 s. */
export async function GET() {
  return NextResponse.json(await getSnapshot(), { headers: { "Cache-Control": "no-store" } });
}
