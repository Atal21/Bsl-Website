import { jwtVerify, SignJWT } from "jose";

// Edge-safe (used by middleware): only depends on `jose`.
export const COOKIE = "bsl_admin";
export const SESSION_DAYS = 7;

export type Session = { id: string; email: string; name: string };

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is not set");
    return new TextEncoder().encode("dev-only-insecure-secret-change-me-before-deploying");
  }
  return new TextEncoder().encode(s);
}

export async function signSession(s: Session) {
  return new SignJWT({ ...s })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
}

export async function verifyToken(token?: string | null): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.id !== "string") return null;
    return { id: payload.id, email: String(payload.email ?? ""), name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}
