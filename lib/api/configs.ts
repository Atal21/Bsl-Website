import { z } from "zod";
import { categorySchema, industrySchema, productSchema } from "@/lib/validators";
import { ensureSlug, type CrudConfig } from "./crud";
import { HttpError } from "./http";

const togglePatch = z.object({
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  order: z.number().int().min(0).max(100000).optional(),
});

export const categoryConfig: CrudConfig = {
  label: "Category",
  collection: (s) => s.categories,
  schema: categorySchema,
  sort: { order: 1, name: 1 },
  async prepare(data, { store, existing }) {
    return { ...data, slug: await ensureSlug(store.categories, data, existing?._id) };
  },
  async afterUpdate(before, after, store) {
    // Keep products attached to the category when its slug changes.
    if (before.slug !== after.slug) await store.products.updateMany({ category: before.slug }, { category: after.slug });
  },
  async beforeDelete(doc, store) {
    const n = await store.products.count({ filter: { category: doc.slug } });
    if (n > 0) throw new HttpError(409, `This category still has ${n} product${n > 1 ? "s" : ""}. Move or delete them first.`);
  },
};

async function renameInIndustries(store: import("@/lib/db/types").Store, from: string, to: string | null) {
  const all = await store.industries.find();
  for (const ind of all) {
    if (!ind.products.includes(from)) continue;
    const next = ind.products.flatMap((s) => (s === from ? (to ? [to] : []) : [s]));
    await store.industries.update(ind._id, { products: next });
  }
}

export const productConfig: CrudConfig = {
  label: "Product",
  collection: (s) => s.products,
  schema: productSchema,
  patchSchema: togglePatch,
  sort: { order: 1, name: 1 },
  async prepare(data, { store, existing }) {
    const cat = await store.categories.findOne({ slug: data.category });
    if (!cat) throw new HttpError(400, `Category "${data.category}" does not exist.`);
    return { ...data, slug: await ensureSlug(store.products, data, existing?._id) };
  },
  async afterUpdate(before, after, store) {
    if (before.slug !== after.slug) await renameInIndustries(store, before.slug, after.slug);
  },
  async afterDelete(doc, store) {
    await renameInIndustries(store, doc.slug, null);
  },
};

export const industryConfig: CrudConfig = {
  label: "Industry",
  collection: (s) => s.industries,
  schema: industrySchema,
  patchSchema: togglePatch.pick({ published: true, order: true }),
  sort: { order: 1, name: 1 },
  async prepare(data, { store, existing }) {
    return { ...data, slug: await ensureSlug(store.industries, data, existing?._id) };
  },
};
