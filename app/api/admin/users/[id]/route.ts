import { handle, HttpError, ok, requireAdmin } from "@/lib/api/http";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export const DELETE = handle<{ params: { id: string } }>(async (req, { params }) => {
  const session = await requireAdmin(req);
  if (params.id === session.id) throw new HttpError(400, "You cannot delete your own account.");
  const store = await getStore();
  if ((await store.admins.count()) <= 1) throw new HttpError(400, "At least one admin must remain.");
  if (!(await store.admins.delete(params.id))) throw new HttpError(404, "Admin not found.");
  return ok({ ok: true });
});
