import crypto from "node:crypto";
import mongoose, { Schema, type Connection, type Model } from "mongoose";
import type { Collection, Filter, Query, Store } from "./types";
import dns from "node:dns";


// MongoDB store built on Mongoose. Documents use string ids (UUIDs) and every collection keeps
// `strict: false`, so the shapes in lib/types.ts stay the single source of truth.

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function buildFilter(q: Pick<Query, "filter" | "search"> = {}): Record<string, unknown> {
  const f: Record<string, unknown> = { ...(q.filter ?? {}) };
  if (q.search && q.search.q.trim()) {
    const rx = new RegExp(escapeRegex(q.search.q.trim()), "i");
    f.$or = q.search.fields.map((field) => ({ [field]: rx }));
  }
  return f;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyModel = Model<any>;

function wrap<T extends { _id: string }>(model: AnyModel): Collection<T> {
  return {
    async find(q: Query = {}) {
      let query = model.find(buildFilter(q));
      if (q.sort) query = query.sort(q.sort);
      if (q.skip) query = query.skip(q.skip);
      if (q.limit) query = query.limit(q.limit);
      return (await query.lean()) as unknown as T[];
    },
    async count(q = {}) {
      return model.countDocuments(buildFilter(q));
    },
    async findById(id) {
      return (await model.findById(id).lean()) as unknown as T | null;
    },
    async findOne(filter: Filter) {
      return (await model.findOne(filter).lean()) as unknown as T | null;
    },
    async insert(doc) {
      const full = { ...doc, _id: doc._id ?? crypto.randomUUID() } as unknown as T;
      await model.create(full);
      return full;
    },
    async update(id, patch) {
      return (await model.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean()) as unknown as T | null;
    },
    async updateMany(filter, patch) {
      return (await model.updateMany(filter, { $set: patch })).modifiedCount;
    },
    async delete(id) {
      return (await model.deleteOne({ _id: id })).deletedCount > 0;
    },
    async deleteMany(filter) {
      return (await model.deleteMany(filter)).deletedCount;
    },
  };
}

function define(conn: Connection, name: string, paths: Record<string, unknown> = {}, indexes: [Record<string, 1 | -1>, Record<string, unknown>?][] = []) {
  const schema = new Schema({ _id: { type: String }, ...paths }, { strict: false, versionKey: false, collection: name, strictQuery: false });
  for (const [fields, opts] of indexes) schema.index(fields, opts);
  return (conn.models[name] as AnyModel) ?? conn.model(name, schema);
}

export async function createMongoStore(uri: string): Promise<Store> {
  const hasDbName = /^mongodb(?:\+srv)?:\/\/[^/]+\/[^/?]+/.test(uri);
  const conn = await mongoose
    .createConnection(uri, { serverSelectionTimeoutMS: 8000, maxPoolSize: 10, ...(hasDbName ? {} : { dbName: "bsl_enterprise" }) })
    .asPromise();

  const models = {
    admins: define(conn, "admins", {}, [[{ email: 1 }, { unique: true }]]),
    categories: define(conn, "categories", {}, [[{ slug: 1 }, { unique: true }]]),
    products: define(conn, "products", {}, [[{ slug: 1 }, { unique: true }], [{ category: 1 }]]),
    industries: define(conn, "industries", {}, [[{ slug: 1 }, { unique: true }]]),
    enquiries: define(conn, "enquiries", {}, [
      [{ createdAt: -1 }],
      [{ status: 1 }],
      [{ email: 1 }],
      [{ ref: 1 }, { unique: true, partialFilterExpression: { ref: { $type: "string" } } }],
    ]),
    media: define(conn, "media", {}, [[{ createdAt: -1 }]]),
    notifications: define(conn, "notifications", {}, [[{ enquiryId: 1, createdAt: -1 }]]),
    otps: define(conn, "otps", {}, [[{ purpose: 1, key: 1, createdAt: -1 }]]),
    settings: define(conn, "settings"),
  };
  const Blob = define(conn, "blobs", { mime: String, data: Buffer });

  // Build indexes up front (idempotent). A failure here (e.g. legacy duplicate data) must not take the site down.
  await Promise.allSettled([...Object.values(models), Blob].map((m) => m.init()));

  return {
    kind: "mongo",
    admins: wrap(models.admins),
    categories: wrap(models.categories),
    products: wrap(models.products),
    industries: wrap(models.industries),
    enquiries: wrap(models.enquiries),
    media: wrap(models.media),
    notifications: wrap(models.notifications),
    otps: wrap(models.otps),
    settings: wrap(models.settings),
    async putBlob(id, data, mime) {
      await Blob.replaceOne({ _id: id }, { _id: id, mime, data }, { upsert: true });
    },
    async getBlob(id) {
      const d = await Blob.findById(id);
      if (!d) return null;
      return { data: Buffer.from(d.data as Buffer), mime: d.mime as string };
    },
    async deleteBlob(id) {
      await Blob.deleteOne({ _id: id });
    },
  };
}
