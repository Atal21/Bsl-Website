import { clientIp, handle, HttpError, ok, parseBody } from "@/lib/api/http";
import { getStore } from "@/lib/db";
import { env } from "@/lib/env";
import { requestOtp } from "@/lib/otp";
import { otpRequestSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

// Same response whether or not the email has any ticket (tracking), so this cannot be used to find out who filed.
export const POST = handle(async (req) => {
  if (!env.otpEnabled()) throw new HttpError(400, "OTP verification is not enabled.");
  const { purpose, email } = await parseBody(req, otpRequestSchema);
  const result = await requestOtp(await getStore(), { purpose, email, ip: clientIp(req) });
  return ok({ ok: true, message: "If this email can receive a code, it is on its way.", ...result });
});
