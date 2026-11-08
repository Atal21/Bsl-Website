import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { COOKIE, SESSION_DAYS, verifyToken, type Session } from "./auth-token";
import { getStore } from "./db";

export { COOKIE, SESSION_DAYS };
export type { Session };

export const hashPassword = (pw: string) => bcrypt.hash(pw, 12);
export const checkPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

/** Current admin for server components (panel layout). Returns null if not signed in. */
export async function getAdminSession(): Promise<Session | null> {
  const session = await verifyToken(cookies().get(COOKIE)?.value);
  if (!session) return null;
  const store = await getStore();
  const admin = await store.admins.findById(session.id);
  return admin ? { id: admin._id, email: admin.email, name: admin.name } : null;
}

// A valid hash to compare against when the email is unknown (keeps login timing uniform).
export const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

const WEAK_PASSWORDS = new Set(["changeme-12345", "changeme", "password", "password123", "admin123", "admin@123", "12345678"]);

/** If no admin exists yet and ADMIN_EMAIL / ADMIN_PASSWORD are set, create the first admin. */
export async function bootstrapAdmin() {
  const store = await getStore();
  if ((await store.admins.count()) > 0) return;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) return;
  if (process.env.NODE_ENV === "production" && (password.length < 10 || WEAK_PASSWORDS.has(password.toLowerCase()))) {
    console.error("[auth] ADMIN_PASSWORD is too weak/default - refusing to create the first admin. Use 10+ characters.");
    return;
  }
  await store.admins.insert({
    email,
    name: process.env.ADMIN_NAME?.trim() || "Admin",
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  });
}
