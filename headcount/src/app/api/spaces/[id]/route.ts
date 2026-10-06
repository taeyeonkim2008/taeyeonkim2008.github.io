import { NextResponse } from "next/server";
import { getSpace } from "@/config/spaces";
import { getSpaceDetail, parsePreviewAt } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

/** Current occupancy plus today's hourly curve for one space. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getSpace(id)) return NextResponse.json({ error: "Unknown space" }, { status: 404 });
  const at = parsePreviewAt(new URL(req.url).searchParams.get("at"));
  return NextResponse.json(await getSpaceDetail(id, at), { headers: { "Cache-Control": "no-store" } });
}
