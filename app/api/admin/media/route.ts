import { handle, HttpError, ok, requireAdmin } from "@/lib/api/http";
import { getStore } from "@/lib/db";
import { saveImage } from "@/lib/media";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const GET = handle(async (req) => {
  await requireAdmin(req);
  const store = await getStore();
  return ok(await store.media.find({ sort: { createdAt: -1 } }));
});

export const POST = handle(async (req) => {
  await requireAdmin(req);
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw new HttpError(400, "Upload must be multipart form data.");
  }
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) throw new HttpError(400, "Choose at least one image.");
  if (files.length > 12) throw new HttpError(400, "Upload at most 12 images at a time.");
  const store = await getStore();
  const saved = [];
  for (const f of files) saved.push(await saveImage(f, store));
  return ok(saved, 201);
});
