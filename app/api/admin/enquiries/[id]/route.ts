import { handle, HttpError, nowIso, ok, parseBody, requireAdmin } from "@/lib/api/http";
import { getStore } from "@/lib/db";
import { notifyEnquiry } from "@/lib/notify";
import { enquiryPatchSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
type Ctx = { params: { id: string } };

// Enquiry + its notification log (masked address, sent/failed/skipped).
export const GET = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req);
  const store = await getStore();
  const enquiry = await store.enquiries.findById(params.id);
  if (!enquiry) throw new HttpError(404, "Enquiry not found.");
  const log = await store.notifications.find({ filter: { enquiryId: enquiry._id }, sort: { createdAt: -1 }, limit: 50 });
  return ok({ enquiry, log });
});

export const PATCH = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req);
  const { notify = true, ...patch } = await parseBody(req, enquiryPatchSchema);
  const store = await getStore();
  const before = await store.enquiries.findById(params.id);
  if (!before) throw new HttpError(404, "Enquiry not found.");
  const updated = await store.enquiries.update(params.id, { ...patch, updatedAt: nowIso() });
  if (!updated) throw new HttpError(404, "Enquiry not found.");

  // Notify only when the status really changed and the admin left "Notify customer" ticked.
  // notifyEnquiry never throws, so a mail problem can't fail the update.
  let notification: string = "off";
  if (patch.status && patch.status !== before.status && notify) notification = await notifyEnquiry(store, updated, "status");
  return ok({ ...updated, notification });
});

export const DELETE = handle<Ctx>(async (req, { params }) => {
  await requireAdmin(req);
  const store = await getStore();
  if (!(await store.enquiries.delete(params.id))) throw new HttpError(404, "Enquiry not found.");
  await store.notifications.deleteMany({ enquiryId: params.id }).catch(() => {});
  return ok({ ok: true });
});
