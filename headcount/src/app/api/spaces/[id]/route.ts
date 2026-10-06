import { NextResponse } from "next/server";
import { getSpace } from "@/config/spaces";
import { getSpaceDetail } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

/** Current occupancy plus today's hourly curve for one space. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getSpace(id)) return NextResponse.json({ error: "Unknown space" }, { status: 404 });
  return NextResponse.json(await getSpaceDetail(id), { headers: { "Cache-Control": "no-store" } });
}
