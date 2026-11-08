import { unstable_cache } from "next/cache";
import { getStore } from "./db";
import { mergeSettings } from "./site";
import type { Category, Industry, Product, ProductSummary, SiteSettings } from "./types";

// Public-site getters. Results are cached for a minute and refreshed immediately when the admin
// panel saves something (it calls revalidateTag("catalog")).

export const CATALOG_TAG = "catalog";

const cached = <T>(key: string, fn: () => Promise<T>) =>
  unstable_cache(fn, [key], { tags: [CATALOG_TAG], revalidate: 60 });

export const getSettings = cached<SiteSettings>("settings", async () => {
  const store = await getStore();
  const { _id, ...saved } = (await store.settings.findById("site")) ?? ({} as { _id?: string });
  void _id;
  return mergeSettings(saved as Partial<SiteSettings>);
});

export const getCategories = cached<Category[]>("categories", async () => {
  const store = await getStore();
  return store.categories.find({ sort: { order: 1, name: 1 } });
});

export const getProducts = cached<Product[]>("products", async () => {
  const store = await getStore();
  return store.products.find({ filter: { published: true }, sort: { order: 1, name: 1 } });
});

export const getIndustries = cached<Industry[]>("industries", async () => {
  const store = await getStore();
  return store.industries.find({ filter: { published: true }, sort: { order: 1, name: 1 } });
});

export async function getProduct(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug) ?? null;
}

/** Strip a product down to what listing pages need (spec tables and long text stay on the detail page). */
export function summarizeProduct(p: Product): ProductSummary {
  return {
    _id: p._id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    tagline: p.tagline,
    image: p.image,
    fit: p.fit,
    highlights: p.highlights,
    applications: p.applications,
    featured: p.featured,
    order: p.order,
  };
}
