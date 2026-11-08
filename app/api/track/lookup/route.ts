import { clientIp, handle, HttpError, ok, parseBody } from "@/lib/api/http";
import { getStore } from "@/lib/db";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";
import { normalizeRef } from "@/lib/ref";
import { trackLookupSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

// Tracking when OTP is switched off: ticket number + last 4 digits of the phone number.
export const POST = handle(async (req) => {
  if (env.otpEnabled()) throw new HttpError(400, "Please use email verification to track your enquiry.");
  if (!rateLimit(`track:${clientIp(req)}`, 10, 10 * 60_000)) throw new HttpError(429, "Too many attempts. Please try again in a few minutes.");
  const { ref, last4 } = await parseBody(req, trackLookupSchema);
  const store = await getStore();
  const t = await store.enquiries.findOne({ ref: normalizeRef(ref) });
  if (!t || t.phone.replace(/\D/g, "").slice(-4) !== last4) throw new HttpError(404, "No enquiry found with those details.");
  return ok({ ok: true, tickets: [{ ref: t.ref, status: t.status, createdAt: t.createdAt }] });
});
