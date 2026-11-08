import { revalidateCatalog } from "@/lib/api/crud";
import { handle, ok, parseBody, requireAdmin } from "@/lib/api/http";
import { getStore } from "@/lib/db";
import { mergeSettings } from "@/lib/site";
import { settingsSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export const GET = handle(async (req) => {
  await requireAdmin(req);
  const store = await getStore();
  const { _id, ...saved } = (await store.settings.findById("site")) ?? ({} as { _id?: string });
  void _id;
  return ok(mergeSettings(saved));
});

export const PUT = handle(async (req) => {
  await requireAdmin(req);
  const data = await parseBody(req, settingsSchema);
  const store = await getStore();
  const next = { ...data, whatsapp: data.whatsapp.replace(/\D/g, "") };
  if (await store.settings.findById("site")) await store.settings.update("site", next);
  else await store.settings.insert({ _id: "site", ...next });
  revalidateCatalog();
  return ok(next);
});
