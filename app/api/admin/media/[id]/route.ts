import { z } from "zod";
import { handle, HttpError, nowIso, ok, parseBody, requireAdmin } from "@/lib/api/http";
import { getStore } from "@/lib/db";
import { deleteImage, findMediaUsage } from "@/lib/media";

export const dynamic = "force-dynamic";
type Ctx = { params: { id: string } };

export const PATCH = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req);
  const { alt } = await parseBody(req, z.object({ alt: z.string().trim().max(200) }));
  const store = await getStore();
  const updated = await store.media.update(params.id, { alt, updatedAt: nowIso() } as never);
  if (!updated) throw new HttpError(404, "Image not found.");
  return ok(updated);
});

export const DELETE = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req);
  const store = await getStore();
  const item = await store.media.findById(params.id);
  if (!item) throw new HttpError(404, "Image not found.");
  if (new URL(req.url).searchParams.get("force") !== "1") {
    const usage = await findMediaUsage(store, item.url);
    if (usage.length) throw new HttpError(409, "This image is still in use.", { usage });
  }
  await deleteImage(item, store);
  return ok({ ok: true });
});
