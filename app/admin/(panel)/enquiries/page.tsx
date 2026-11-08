import EnquiriesManager from "@/components/admin/EnquiriesManager";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EnquiriesPage({ searchParams }: { searchParams: { open?: string } }) {
  const s = await getStore();
  const items = await s.enquiries.find({ sort: { createdAt: -1 } });
  return <EnquiriesManager initial={items} openId={searchParams.open} />;
}
