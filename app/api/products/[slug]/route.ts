import { handle } from "@/lib/api/http";
import { publicError, publicJson } from "@/lib/api/public";
import { getProduct } from "@/lib/data";

export const dynamic = "force-dynamic";

// GET /api/products/hydraulic-scissor-lift - one published product with its full details and spec table.
export const GET = handle<{ params: { slug: string } }>(async (_req, { params }) => {
  const product = await getProduct(params.slug);
  if (!product) return publicError(404, "Product not found.");
  return publicJson(product);
});
