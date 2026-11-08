import crypto from "node:crypto";
import sharp, { type OutputInfo } from "sharp";
import { HttpError, nowIso } from "@/lib/api/http";
import {
  cloudDestroy,
  cloudinaryConfig,
  cloudUpload,
  requireCloudinary,
} from "@/lib/cloudinary";
import type { Store } from "@/lib/db/types";
import type { MediaItem } from "@/lib/types";

export const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
export const MAX_BYTES = 8 * 1024 * 1024;

export async function saveImage(
  file: File,
  store: Store,
  alt = "",
): Promise<MediaItem> {
  if (!ALLOWED_MIME.has(file.type))
    throw new HttpError(
      415,
      `${file.name}: only JPG, PNG, WebP or AVIF images are allowed.`,
    );
  if (file.size > MAX_BYTES)
    throw new HttpError(
      413,
      `${file.name} is larger than ${MAX_BYTES / 1024 / 1024} MB.`,
    );

  // Images live on Cloudinary only - the database stores just the resulting URL.
  const cld = requireCloudinary();

  let out: { data: Buffer; info: OutputInfo };
  try {
    // Re-encode: strips metadata, fixes rotation, caps dimensions and keeps files light.
    out = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({
        width: 1800,
        height: 1800,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new HttpError(400, `${file.name} is not a valid image.`);
  }

  const id = crypto.randomUUID();
  const filename = `${
    file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^\w.-]+/g, "-")
      .slice(0, 80) || "image"
  }.webp`;
  const { url, publicId } = await cloudUpload(out.data, cld);

  return store.media.insert({
    _id: id,
    filename,
    mime: "image/webp",
    size: out.info.size,
    width: out.info.width,
    height: out.info.height,
    alt: alt.slice(0, 200),
    url,
    provider: "cloudinary",
    publicId,
    createdAt: nowIso(),
  });
}

export async function deleteImage(item: MediaItem, store: Store) {
  if (item.provider === "cloudinary" && item.publicId) {
    const c = cloudinaryConfig();
    if (c) await cloudDestroy(item.publicId, c);
  } else {
    await store.deleteBlob(item._id);
  }
  await store.media.delete(item._id);
}

/** Where an image URL is referenced (so the admin gets a warning before deleting it). */
export async function findMediaUsage(
  store: Store,
  url: string,
): Promise<string[]> {
  const [cats, prods] = await Promise.all([
    store.categories.find(),
    store.products.find(),
  ]);
  const used: string[] = [];
  for (const c of cats) if (c.image === url) used.push(`Category: ${c.name}`);
  for (const p of prods)
    if (p.image === url || p.gallery.includes(url))
      used.push(`Product: ${p.name}`);
  return used;
}
