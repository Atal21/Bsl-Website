import { handle, HttpError, ok, parseBody } from "@/lib/api/http";
import { getStore } from "@/lib/db";
import { env } from "@/lib/env";
import { verifyOtp } from "@/lib/otp";
import { otpVerifySchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export const POST = handle(async (req) => {
  if (!env.otpEnabled()) throw new HttpError(400, "OTP verification is not enabled.");
  const { purpose, email, code } = await parseBody(req, otpVerifySchema);
  const store = await getStore();
  const rec = await verifyOtp(store, { purpose, email, code });

  if (purpose === "file") return ok({ ok: true, token: rec._id });

  // Tracking: single use - the code is spent as soon as it has shown the tickets.
  await store.otps.update(rec._id, { consumedAt: new Date().toISOString() });
  const tickets = await store.enquiries.find({ filter: { email: rec.key }, sort: { createdAt: -1 }, limit: 50 });
  return ok({ ok: true, tickets: tickets.map((t) => ({ ref: t.ref, status: t.status, createdAt: t.createdAt })) });
});
