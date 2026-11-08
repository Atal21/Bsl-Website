import CategoriesManager from "@/components/admin/CategoriesManager";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const s = await getStore();
  const [cats, products] = await Promise.all([s.categories.find({ sort: { order: 1 } }), s.products.find()]);
  const counts: Record<string, number> = {};
  for (const p of products) counts[p.category] = (counts[p.category] ?? 0) + 1;
  return <CategoriesManager initial={cats} counts={counts} />;
}
