import type { Admin, Category, Enquiry, Industry, MediaItem, NotificationLog, OtpRecord, Product, SettingsDoc } from "@/lib/types";

export type Filter = Record<string, unknown>; // equality, or { $gte }, { $lt }, { $in }
export type Query = {
  filter?: Filter;
  search?: { fields: string[]; q: string };
  sort?: Record<string, 1 | -1>;
  skip?: number;
  limit?: number;
};

export interface Collection<T extends { _id: string }> {
  find(q?: Query): Promise<T[]>;
  count(q?: Pick<Query, "filter" | "search">): Promise<number>;
  findById(id: string): Promise<T | null>;
  findOne(filter: Filter): Promise<T | null>;
  insert(doc: Omit<T, "_id"> & { _id?: string }): Promise<T>;
  update(id: string, patch: Partial<Omit<T, "_id">>): Promise<T | null>;
  updateMany(filter: Filter, patch: Partial<Omit<T, "_id">>): Promise<number>;
  delete(id: string): Promise<boolean>;
  deleteMany(filter: Filter): Promise<number>;
}

export interface Store {
  kind: "mongo";
  admins: Collection<Admin>;
  categories: Collection<Category>;
  products: Collection<Product>;
  industries: Collection<Industry>;
  enquiries: Collection<Enquiry>;
  media: Collection<MediaItem>;
  notifications: Collection<NotificationLog>;
  otps: Collection<OtpRecord>;
  settings: Collection<SettingsDoc>;
  putBlob(id: string, data: Buffer, mime: string): Promise<void>;
  getBlob(id: string): Promise<{ data: Buffer; mime: string } | null>;
  deleteBlob(id: string): Promise<void>;
}

export const COLLECTIONS = ["admins", "categories", "products", "industries", "enquiries", "media", "notifications", "otps", "settings"] as const;
