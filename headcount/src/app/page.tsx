import { SPACES } from "@/config/spaces";
import { getSnapshot } from "@/lib/snapshot";
import HomeView from "@/components/HomeView";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return <HomeView spaces={SPACES} initial={await getSnapshot()} />;
}
