import crypto from "node:crypto";
import { HttpError } from "@/lib/api/http";

export type CloudinaryConfig = { cloud: string; key: string; secret: string };

const clean = (v?: string) => (v ?? "").trim().replace(/^["']|["']$/g, "");

/**
 * Cloudinary credentials, from either style:
 *   CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET
 *   CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
 */
export function cloudinaryConfig(): CloudinaryConfig | null {
  const cloud = clean(process.env.CLOUDINARY_CLOUD_NAME);
  const key = clean(process.env.CLOUDINARY_API_KEY);
  const secret = clean(process.env.CLOUDINARY_API_SECRET);
  if (cloud && key && secret) return { cloud, key, secret };

  const m = clean(process.env.CLOUDINARY_URL).match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  return m ? { key: m[1], secret: m[2], cloud: m[3] } : null;
}

export const cloudinaryConfigured = () => cloudinaryConfig() !== null;

const sign = (params: Record<string, string | number>, secret: string) =>
  crypto
    .createHash("sha1")
    .update(
      Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join("&") + secret,
    )
    .digest("hex");

export function requireCloudinary(): CloudinaryConfig {
  const c = cloudinaryConfig();
  if (!c) {
    throw new HttpError(
      503,
      "Image storage (Cloudinary) is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.local and restart the server.",
    );
  }
  return c;
}

/** Upload one image buffer to Cloudinary. Returns the permanent https URL and the public id. */
export async function cloudUpload(data: Buffer, c: CloudinaryConfig, folder = "bsl-enterprise") {
  const timestamp = Math.floor(Date.now() / 1000);
  const form = new FormData();
  form.set("file", new Blob([new Uint8Array(data)], { type: "image/webp" }), "upload.webp");
  form.set("api_key", c.key);
  form.set("timestamp", String(timestamp));
  form.set("folder", folder);
  form.set("signature", sign({ folder, timestamp }, c.secret));

  let res: Response;
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(c.cloud)}/image/upload`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(45_000),
    });
  } catch (e) {
    console.error("[cloudinary] network error", e);
    throw new HttpError(502, "Could not reach Cloudinary (network problem or timeout). Please try again.");
  }
  const json = (await res.json().catch(() => ({}))) as { secure_url?: string; public_id?: string; error?: { message: string } };
  if (!res.ok || !json.secure_url) {
    const reason = json.error?.message ?? `HTTP ${res.status}`;
    console.error("[cloudinary] upload failed:", reason);
    throw new HttpError(502, `Cloudinary upload failed: ${reason}`);
  }
  return { url: json.secure_url, publicId: json.public_id as string };
}

export async function cloudDestroy(publicId: string, c: CloudinaryConfig) {
  const timestamp = Math.floor(Date.now() / 1000);
  const form = new FormData();
  form.set("public_id", publicId);
  form.set("api_key", c.key);
  form.set("timestamp", String(timestamp));
  form.set("signature", sign({ public_id: publicId, timestamp }, c.secret));
  await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(c.cloud)}/image/destroy`, { method: "POST", body: form }).catch(() => {});
}

/** Credentials check for the diagnostics endpoint. */
export async function cloudPing(c: CloudinaryConfig): Promise<{ ok: boolean; detail: string }> {
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(c.cloud)}/ping`, {
      headers: { Authorization: `Basic ${Buffer.from(`${c.key}:${c.secret}`).toString("base64")}` },
      signal: AbortSignal.timeout(10_000),
    });
    const json = (await res.json().catch(() => ({}))) as { status?: string; error?: { message: string } };
    return res.ok && json.status === "OK" ? { ok: true, detail: "Credentials accepted" } : { ok: false, detail: json.error?.message ?? `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : "Unreachable" };
  }
}
