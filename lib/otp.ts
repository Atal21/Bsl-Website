import crypto from "node:crypto";
import { HttpError, nowIso } from "@/lib/api/http";
import type { Store } from "@/lib/db/types";
import { deliver, maskEmail } from "@/lib/notify";
import { getSettings } from "@/lib/data";
import { otpEmail } from "@/lib/notify/templates";
import { emptySettings } from "@/lib/site";
import { normalizeEmail } from "@/lib/ref";
import type { OtpPurpose, OtpRecord } from "@/lib/types";

export const OTP_TTL_MS = 5 * 60_000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_MS = 30_000;
export const OTP_PER_EMAIL = 3; // codes per window
export const OTP_PER_IP = 10;
export const OTP_WINDOW_MS = 10 * 60_000;
const FILE_TOKEN_TTL_MS = 30 * 60_000;

const secret = () => process.env.AUTH_SECRET || "dev-only-otp-secret";
const hash = (id: string, email: string, code: string) =>
  crypto
    .createHmac("sha256", secret())
    .update(`${id}:${email}:${code}`)
    .digest("hex");
const iso = (ms: number) => new Date(ms).toISOString();

// Serialise verification attempts per email inside this server process so parallel guesses cannot beat the attempt limit.
const g = globalThis as unknown as {
  __otpLocks?: Map<string, Promise<unknown>>;
};
const locks = (g.__otpLocks ??= new Map());
async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  const run = prev.then(fn, fn);
  const tail = run.catch(() => {});
  locks.set(key, tail);
  try {
    return await run;
  } finally {
    if (locks.get(key) === tail) locks.delete(key);
  }
}

export async function requestOtp(
  store: Store,
  input: { purpose: OtpPurpose; email: string; ip: string },
) {
  const email = normalizeEmail(input.email);
  const now = Date.now();

  // housekeeping: drop records that expired over a day ago
  await store.otps
    .deleteMany({ expiresAt: { $lt: iso(now - 24 * 3600_000) } })
    .catch(() => {});

  const since = iso(now - OTP_WINDOW_MS);
  const recent = await store.otps.find({
    filter: { purpose: input.purpose, key: email, createdAt: { $gte: since } },
    sort: { createdAt: -1 },
  });
  if (recent[0]) {
    const wait = Math.ceil(
      (OTP_RESEND_MS - (now - Date.parse(recent[0].createdAt))) / 1000,
    );
    if (wait > 0)
      throw new HttpError(
        429,
        `Please wait ${wait} seconds before requesting another code.`,
        { retryAfter: wait },
      );
  }
  if (recent.length >= OTP_PER_EMAIL)
    throw new HttpError(
      429,
      "Too many codes requested for this email. Please try again in a few minutes.",
    );
  if (
    (await store.otps.count({
      filter: { ip: input.ip, createdAt: { $gte: since } },
    })) >= OTP_PER_IP
  ) {
    throw new HttpError(
      429,
      "Too many requests from this connection. Please try again later.",
    );
  }

  // Tracking: only emails that actually have a ticket receive a code, but the record (and so every limit)
  // is created either way and the caller gets the same answer.
  const hasTicket =
    input.purpose === "file"
      ? true
      : (await store.enquiries.count({ filter: { email } })) > 0;
  const id = crypto.randomUUID();
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  await store.otps.insert({
    _id: id,
    purpose: input.purpose,
    key: email,
    codeHash: hash(id, email, code),
    expiresAt: iso(now + OTP_TTL_MS),
    attempts: 0,
    sent: hasTicket,
    ip: input.ip,
    createdAt: nowIso(),
  });

  if (hasTicket) {
    const site = await getSettings().catch(() => null);
    const mail = otpEmail(site ?? emptySettings, { code, purpose: input.purpose, ttlMinutes: OTP_TTL_MS / 60_000 });
    const sent = await deliver("email", { to: email, ...mail }, { consoleBody: `OTP code for ${maskEmail(email)} (${input.purpose}): ${code}` }); // dev console only; never stored or logged in production
    if (input.purpose === "file" && sent.status === "failed") {
      throw new HttpError(
        502,
        "We could not send the verification email right now. Please try again in a minute or call us.",
      );
    }
  } else await new Promise((r) => setTimeout(r, 700 + Math.random() * 500)); // roughly match the time an email send takes
  return { resendIn: OTP_RESEND_MS / 1000, expiresIn: OTP_TTL_MS / 1000 };
}

/** Checks a code. Returns the (now verified) record. Throws a 400 with a deliberately vague message on any failure. */
export async function verifyOtp(
  store: Store,
  input: { purpose: OtpPurpose; email: string; code: string },
): Promise<OtpRecord> {
  const email = normalizeEmail(input.email);
  return withLock(`${input.purpose}:${email}`, async () => {
    const [latest] = await store.otps.find({
      filter: { purpose: input.purpose, key: email },
      sort: { createdAt: -1 },
      limit: 1,
    });
    const fail = (msg = "That code is incorrect or has expired.") =>
      new HttpError(400, msg);
    if (
      !latest ||
      latest.consumedAt ||
      Date.parse(latest.expiresAt) < Date.now()
    )
      throw fail();
    if (latest.attempts >= OTP_MAX_ATTEMPTS)
      throw fail("Too many wrong attempts. Please request a new code.");

    const updated = await store.otps.update(latest._id, {
      attempts: latest.attempts + 1,
    });
    const expected = Buffer.from(hash(latest._id, email, input.code.trim()));
    const actual = Buffer.from(latest.codeHash);
    const match =
      expected.length === actual.length &&
      crypto.timingSafeEqual(expected, actual);
    if (!match || !latest.sent) {
      throw (updated?.attempts ?? 1) >= OTP_MAX_ATTEMPTS
        ? fail("Too many wrong attempts. Please request a new code.")
        : fail();
    }
    const verified = await store.otps.update(latest._id, {
      verifiedAt: nowIso(),
    });
    return verified ?? latest;
  });
}

/** Filing: turn the verified-code id into a single-use permission to create one enquiry for that email. */
export async function consumeFileToken(
  store: Store,
  token: string,
  email: string,
) {
  const rec = token ? await store.otps.findById(token) : null;
  const ok =
    rec &&
    rec.purpose === "file" &&
    rec.key === normalizeEmail(email) &&
    rec.verifiedAt &&
    !rec.consumedAt &&
    Date.now() - Date.parse(rec.verifiedAt) < FILE_TOKEN_TTL_MS;
  if (!ok)
    throw new HttpError(
      400,
      "Please verify your email with the code we send you before submitting.",
    );
  await store.otps.update(rec._id, { consumedAt: nowIso() });
}
