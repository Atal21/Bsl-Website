import ProductsManager from "@/components/admin/ProductsManager";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const s = await getStore();
  const [products, categories] = await Promise.all([s.products.find({ sort: { order: 1, name: 1 } }), s.categories.find({ sort: { order: 1 } })]);
  return <ProductsManager initial={products} categories={categories} />;
}
