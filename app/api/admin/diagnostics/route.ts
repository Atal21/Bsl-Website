import { handle, ok, requireAdmin } from "@/lib/api/http";
import { cloudinaryConfig, cloudPing } from "@/lib/cloudinary";
import { getStore } from "@/lib/db";
import { verifySmtp } from "@/lib/notify/providers/email";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Admin-only health check: open /api/admin/diagnostics while signed in to see whether
 * MongoDB, Cloudinary and SMTP are each working, with the real reason when they are not.
 * Never returns secrets.
 */
export const GET = handle(async (req) => {
  await requireAdmin(req);

  const database = await getStore()
    .then(async (s) => {
      await s.settings.count();
      return { ok: true, detail: `Connected (${s.kind})` };
    })
    .catch((e: unknown) => ({ ok: false, detail: e instanceof Error ? e.message : "Failed" }));

  const c = cloudinaryConfig();
  const cloudinary = c
    ? { cloudName: c.cloud, ...(await cloudPing(c)) }
    : { ok: false, detail: "Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET" };

  const email = process.env.SMTP_HOST
    ? { host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT) || 587, user: process.env.SMTP_USER ?? "", ...(await verifySmtp()) }
    : { ok: false, detail: "SMTP_HOST is not set" };

  return ok({ database, cloudinary, email, otpEnabled: process.env.OTP_ENABLED === "true" });
});
