import type { MetadataRoute } from "next";
import { getProducts, getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, products] = await Promise.all([getSettings(), getProducts()]);
  const base = siteUrl(site);
  const now = new Date();
  const pages = ["", "/products", "/industries", "/about", "/contact"].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  const items = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...pages, ...items];
}
