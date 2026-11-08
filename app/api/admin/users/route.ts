import { hashPassword } from "@/lib/auth";
import { handle, HttpError, nowIso, ok, parseBody, requireAdmin } from "@/lib/api/http";
import { getStore } from "@/lib/db";
import { adminCreateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export const GET = handle(async (req) => {
  await requireAdmin(req);
  const store = await getStore();
  const admins = await store.admins.find({ sort: { createdAt: 1 } });
  return ok(admins.map(({ passwordHash, ...a }) => (void passwordHash, a)));
});

export const POST = handle(async (req) => {
  await requireAdmin(req);
  const data = await parseBody(req, adminCreateSchema);
  const store = await getStore();
  if (await store.admins.findOne({ email: data.email })) throw new HttpError(409, "An admin with this email already exists.");
  const admin = await store.admins.insert({
    email: data.email,
    name: data.name,
    passwordHash: await hashPassword(data.password),
    createdAt: nowIso(),
  });
  return ok({ _id: admin._id, email: admin.email, name: admin.name, createdAt: admin.createdAt }, 201);
});
