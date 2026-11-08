import { handle } from "@/lib/api/http";
import { publicJson } from "@/lib/api/public";
import { getProducts, summarizeProduct } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * GET /api/products?category=scissor-lifts&featured=true&q=mobile&full=1
 * Published products. Lightweight summaries by default; `full=1` includes descriptions and spec tables.
 */
export const GET = handle(async (req) => {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const featured = url.searchParams.get("featured");
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase().slice(0, 100);
  const full = url.searchParams.get("full") === "1";

  let list = await getProducts();
  if (category) list = list.filter((p) => p.category === category);
  if (featured === "true") list = list.filter((p) => p.featured);
  if (q) list = list.filter((p) => `${p.name} ${p.tagline}`.toLowerCase().includes(q));

  return publicJson({ count: list.length, products: full ? list : list.map(summarizeProduct) });
});
