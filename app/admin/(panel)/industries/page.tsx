import IndustriesManager from "@/components/admin/IndustriesManager";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function IndustriesPage() {
  const s = await getStore();
  const [inds, products] = await Promise.all([s.industries.find({ sort: { order: 1 } }), s.products.find({ sort: { name: 1 } })]);
  return <IndustriesManager initial={inds} products={products.map((p) => ({ slug: p.slug, name: p.name }))} />;
}
