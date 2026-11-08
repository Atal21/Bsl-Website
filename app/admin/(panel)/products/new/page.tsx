import ProductForm from "@/components/admin/ProductForm";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewProduct() {
  const s = await getStore();
  return <ProductForm categories={await s.categories.find({ sort: { order: 1 } })} />;
}
