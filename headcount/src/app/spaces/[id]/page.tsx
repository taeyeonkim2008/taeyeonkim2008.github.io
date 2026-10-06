import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSpace } from "@/config/spaces";
import { getSpaceDetail } from "@/lib/snapshot";
import SpaceDetailView from "@/components/SpaceDetailView";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ floor?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const space = getSpace((await params).id);
  return { title: space?.name ?? "Not found" };
}

export default async function SpacePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { floor } = await searchParams;
  const space = getSpace(id);
  if (!space) notFound();
  return <SpaceDetailView space={space} initial={await getSpaceDetail(id)} highlightFloor={floor} />;
}
