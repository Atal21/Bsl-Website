import { revalidateTag } from "next/cache";
import type { ZodType } from "zod";
import { CATALOG_TAG } from "@/lib/data";
import { getStore } from "@/lib/db";
import type { Collection, Store } from "@/lib/db/types";
import { slugify } from "@/lib/slug";
import { handle, HttpError, nowIso, ok, parseBody, requireAdmin } from "./http";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const revalidateCatalog = () => revalidateTag(CATALOG_TAG);

export type CrudConfig = {
  label: string;
  collection: (s: Store) => Collection<any>;
  schema: ZodType<any>;
  patchSchema?: ZodType<any>;
  sort: Record<string, 1 | -1>;
  prepare?: (data: any, ctx: { store: Store; existing?: any }) => Promise<any>;
  afterUpdate?: (before: any, after: any, store: Store) => Promise<void>;
  beforeDelete?: (doc: any, store: Store) => Promise<void>;
  afterDelete?: (doc: any, store: Store) => Promise<void>;
};

/** Slug from the typed slug (or the name), rejecting duplicates with a readable message. */
export async function ensureSlug(col: Collection<any>, data: { slug?: string; name: string }, selfId?: string) {
  const slug = slugify(data.slug || data.name);
  if (!slug) throw new HttpError(400, "Could not build a URL slug from that name.");
  const clash = await col.findOne({ slug });
  if (clash && clash._id !== selfId) throw new HttpError(409, `Another record already uses the slug "${slug}". Choose a different name or slug.`);
  return slug;
}

export function crudCollection(cfg: CrudConfig) {
  return {
    GET: handle(async (req) => {
      await requireAdmin(req);
      const store = await getStore();
      return ok(await cfg.collection(store).find({ sort: cfg.sort }));
    }),
    POST: handle(async (req) => {
      await requireAdmin(req);
      const store = await getStore();
      let data = await parseBody(req, cfg.schema);
      if (cfg.prepare) data = await cfg.prepare(data, { store });
      const now = nowIso();
      const doc = await cfg.collection(store).insert({ ...data, createdAt: now, updatedAt: now });
      revalidateCatalog();
      return ok(doc, 201);
    }),
  };
}

type Ctx = { params: { id: string } };

export function crudItem(cfg: CrudConfig) {
  return {
    GET: handle<Ctx>(async (req, { params }) => {
      await requireAdmin(req);
      const store = await getStore();
      const doc = await cfg.collection(store).findById(params.id);
      if (!doc) throw new HttpError(404, `${cfg.label} not found.`);
      return ok(doc);
    }),
    PUT: handle<Ctx>(async (req, { params }) => {
      await requireAdmin(req);
      const store = await getStore();
      const col = cfg.collection(store);
      const existing = await col.findById(params.id);
      if (!existing) throw new HttpError(404, `${cfg.label} not found.`);
      let data = await parseBody(req, cfg.schema);
      if (cfg.prepare) data = await cfg.prepare(data, { store, existing });
      const updated = await col.update(params.id, { ...data, updatedAt: nowIso() });
      if (cfg.afterUpdate) await cfg.afterUpdate(existing, updated, store);
      revalidateCatalog();
      return ok(updated);
    }),
    PATCH: handle<Ctx>(async (req, { params }) => {
      await requireAdmin(req);
      if (!cfg.patchSchema) throw new HttpError(405, "Not supported.");
      const store = await getStore();
      const patch = await parseBody(req, cfg.patchSchema);
      const updated = await cfg.collection(store).update(params.id, { ...patch, updatedAt: nowIso() });
      if (!updated) throw new HttpError(404, `${cfg.label} not found.`);
      revalidateCatalog();
      return ok(updated);
    }),
    DELETE: handle<Ctx>(async (req, { params }) => {
      await requireAdmin(req);
      const store = await getStore();
      const col = cfg.collection(store);
      const doc = await col.findById(params.id);
      if (!doc) throw new HttpError(404, `${cfg.label} not found.`);
      if (cfg.beforeDelete) await cfg.beforeDelete(doc, store);
      await col.delete(params.id);
      if (cfg.afterDelete) await cfg.afterDelete(doc, store);
      revalidateCatalog();
      return ok({ ok: true });
    }),
  };
}
