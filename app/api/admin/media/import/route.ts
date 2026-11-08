import { z } from "zod";
import { handle, ok, parseBody, requireAdmin } from "@/lib/api/http";
import { getStore } from "@/lib/db";
import { saveImage } from "@/lib/media";
import { fetchRemoteImage } from "@/lib/remote-image";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Download an image from a link, optimise it and store it exactly like an upload (Cloudinary in production).
export const POST = handle(async (req) => {
  await requireAdmin(req);
  const { url, alt } = await parseBody(req, z.object({ url: z.string().trim().min(1).max(2000), alt: z.string().trim().max(200).default("") }));
  const { file } = await fetchRemoteImage(url);
  return ok(await saveImage(file, await getStore(), alt), 201);
});
