// Fail loudly (and early) when a production deployment is mis-configured.
const isBuild = () => process.env.NEXT_PHASE === "phase-production-build";
const isProd = () => process.env.NODE_ENV === "production";
const flag = (v?: string) => v === "true" || v === "1";

export const env = {
  isProd,
  otpEnabled: () => flag(process.env.OTP_ENABLED),
  // (kept inline: lib/cloudinary imports the API layer, which imports this file)
  cloudinaryConfigured: () =>
    !!(
      process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim()
    ) ||
    /^cloudinary:\/\/[^:]+:[^@]+@.+$/.test(
      process.env.CLOUDINARY_URL?.trim() ?? "",
    ),
};

let warned = false;

/** Called when the data store is first opened (never during `next build`). */
export function assertProductionEnv() {
  if (!isProd() || isBuild()) return;
  const problems: string[] = [];
  if (!process.env.MONGODB_URI) problems.push("MONGODB_URI is not set");
  if (
    process.env.MONGODB_URI &&
    !/^mongodb(\+srv)?:\/\//.test(process.env.MONGODB_URI)
  ) {
    problems.push(
      'MONGODB_URI must start with "mongodb://" or "mongodb+srv://" (check for a missing slash)',
    );
  }
  if ((process.env.AUTH_SECRET ?? "").length < 32)
    problems.push(
      "AUTH_SECRET must be set to a random string of at least 32 characters",
    );
  if (problems.length)
    throw new Error(
      `Server configuration problem (MONGODB/AUTH_SECRET): ${problems.join("; ")}.`,
    );

  if (!warned) {
    warned = true;
    if (!env.cloudinaryConfigured())
      console.warn(
        "[config] Cloudinary is not configured (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET) - image uploads will fail.",
      );
    if (!process.env.SMTP_HOST)
      console.warn(
        "[config] SMTP_HOST is not set - email notifications and OTP emails will be skipped.",
      );
    if (env.otpEnabled() && !process.env.SMTP_HOST)
      console.warn(
        "[config] OTP_ENABLED=true but SMTP is not configured - nobody will receive codes.",
      );
  }
}
