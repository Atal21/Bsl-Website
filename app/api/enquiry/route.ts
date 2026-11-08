import { NextResponse } from "next/server";
import { clientIp, handle, HttpError, nowIso, parseBody } from "@/lib/api/http";
import { getStore } from "@/lib/db";
import { env } from "@/lib/env";
import { notifyAdminNewEnquiry, notifyEnquiry } from "@/lib/notify";
import { consumeFileToken } from "@/lib/otp";
import { rateLimit } from "@/lib/rate-limit";
import { newRef, normalizeEmail } from "@/lib/ref";
import { publicEnquirySchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export const POST = handle(async (req) => {
  if (!rateLimit(`enquiry:${clientIp(req)}`, 5, 10 * 60_000)) {
    throw new HttpError(429, "Too many enquiries from this connection. Please try again later or call us.");
  }
  const data = await parseBody(req, publicEnquirySchema);

  // Spam trap: pretend success so bots don't retry.
  if (data.website) return NextResponse.json({ ok: true });

  if (!/^[+\d][\d\s()-]{6,}$/.test(data.phone)) throw new HttpError(400, "Please enter a valid phone number.");
  const email = data.email ? normalizeEmail(data.email) : "";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "Please enter a valid email address.");

  const store = await getStore();
  const otpOn = env.otpEnabled();
  if (otpOn) {
    if (!email) throw new HttpError(400, "Email is required so we can verify it.");
    await consumeFileToken(store, data.otpToken, email);
  }

  let ref = newRef();
  for (let i = 0; i < 5 && (await store.enquiries.findOne({ ref })); i++) ref = newRef();

  const { website, otpToken, notifyEmail, ...fields } = data;
  void website;
  void otpToken;
  const enquiry = await store.enquiries.insert({
    ...fields,
    email,
    ref,
    notifyEmail: notifyEmail && !!email,
    emailVerified: otpOn,
    status: "new",
    notes: "",
    createdAt: nowIso(),
  });

  // Best effort and in parallel: a failed email must never fail the enquiry (both helpers never throw).
  await Promise.all([notifyEnquiry(store, enquiry, "created"), notifyAdminNewEnquiry(enquiry)]);
  return NextResponse.json({ ok: true, ref });
});
