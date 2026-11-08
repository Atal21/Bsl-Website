import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: { id: string } }) {
  const s = await getStore();
  const product = await s.products.findById(params.id);
  if (!product) notFound();
  return <ProductForm product={product} categories={await s.categories.find({ sort: { order: 1 } })} />;
}
