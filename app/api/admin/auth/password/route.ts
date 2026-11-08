import { checkPassword, hashPassword } from "@/lib/auth";
import { handle, HttpError, ok, parseBody, requireAdmin } from "@/lib/api/http";
import { getStore } from "@/lib/db";
import { passwordChangeSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export const POST = handle(async (req) => {
  const session = await requireAdmin(req);
  const { current, next } = await parseBody(req, passwordChangeSchema);
  const store = await getStore();
  const admin = await store.admins.findById(session.id);
  if (!admin || !(await checkPassword(current, admin.passwordHash))) throw new HttpError(400, "Current password is incorrect.");
  await store.admins.update(admin._id, { passwordHash: await hashPassword(next) });
  return ok({ ok: true });
});
