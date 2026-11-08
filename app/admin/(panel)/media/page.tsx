import MediaManager from "@/components/admin/MediaManager";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const s = await getStore();
  return <MediaManager initial={await s.media.find({ sort: { createdAt: -1 } })} />;
}
