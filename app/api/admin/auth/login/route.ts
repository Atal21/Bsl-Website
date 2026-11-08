import { NextResponse } from "next/server";
import { bootstrapAdmin, checkPassword, DUMMY_HASH, SESSION_DAYS } from "@/lib/auth";
import { COOKIE, signSession } from "@/lib/auth-token";
import { clientIp, handle, HttpError, parseBody } from "@/lib/api/http";
import { getStore } from "@/lib/db";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export const POST = handle(async (req) => {
  const key = `login:${clientIp(req)}`;
  if (!rateLimit(key, 8, 15 * 60_000)) throw new HttpError(429, "Too many attempts. Please try again in a few minutes.");

  const { email, password } = await parseBody(req, loginSchema);
  // Also limit per account so a botnet rotating IPs cannot hammer one admin email.
  if (!rateLimit(`login-email:${email}`, 10, 15 * 60_000)) throw new HttpError(429, "Too many attempts. Please try again in a few minutes.");
  await bootstrapAdmin();
  const store = await getStore();
  const admin = await store.admins.findOne({ email });
  const valid = await checkPassword(password, admin?.passwordHash ?? DUMMY_HASH);

  if (!admin || !valid) {
    if ((await store.admins.count()) === 0) {
      throw new HttpError(
        400,
        "No admin account exists yet. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local (min 8 chars) or run `npm run create-admin`, then try again.",
      );
    }
    throw new HttpError(401, "Invalid email or password.");
  }

  resetRateLimit(key);
  const token = await signSession({ id: admin._id, email: admin.email, name: admin.name });
  const res = NextResponse.json({ ok: true, name: admin.name });
  const https = new URL(req.url).protocol === "https:" || req.headers.get("x-forwarded-proto") === "https";
  res.cookies.set({
    name: COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: https,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return res;
});
