import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { COOKIE, verifyToken, type Session } from "@/lib/auth-token";
import { getStore } from "@/lib/db";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const ok = (data: unknown, status = 200) =>
  NextResponse.json(data, { status });

/**
 * Client IP for rate limits. X-Forwarded-For can be forged by the visitor, so only the entries added by
 * OUR proxies count: with TRUSTED_PROXY_HOPS=1 (Cloud Run) the real client is the last entry, with 2
 * (behind a load balancer) the second to last, and so on.
 */
export function clientIp(req: Request) {
  const hops = Math.max(0, Number(process.env.TRUSTED_PROXY_HOPS ?? 1) || 0);
  const chain = (req.headers.get("x-forwarded-for") ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  if (hops > 0 && chain.length) return chain[Math.max(0, chain.length - hops)];
  return req.headers.get("x-real-ip")?.trim() || "local";
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

/** Wrap a route handler: turns thrown errors into clean JSON responses. */
export function handle<C = unknown>(fn: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof HttpError)
        return NextResponse.json(
          { error: e.message, details: e.details },
          { status: e.status },
        );
      if (e instanceof ZodError) {
        const first = e.issues[0];
        const where = first?.path?.length ? `${first.path.join(".")}: ` : "";
        return NextResponse.json(
          {
            error: `${where}${first?.message ?? "Invalid data"}`,
            issues: e.issues,
          },
          { status: 400 },
        );
      }
      if ((e as { code?: number })?.code === 11000) {
        return NextResponse.json(
          {
            error:
              "A record with the same unique value (slug / email) already exists.",
          },
          { status: 409 },
        );
      }
      console.error("[api]", e);
      // Details help while setting up; in production they stay in the server log only.
      const looksLikeConfig =
        e instanceof Error &&
        /AUTH_SECRET|MONGO|ECONNREFUSED|ServerSelection|ENOTFOUND|querySrv|bad auth|Invalid scheme/i.test(`${e.name} ${e.message}`);
      const msg =
        looksLikeConfig && process.env.NODE_ENV !== "production"
          ? `Server configuration problem: ${(e as Error).message}`
          : looksLikeConfig
            ? "The service is temporarily unavailable. Please try again shortly."
            : "Something went wrong on the server.";
      return NextResponse.json({ error: msg }, { status: looksLikeConfig ? 503 : 500 });
    }
  };
}

export async function parseBody<T>(
  req: Request,
  schema: ZodType<T>,
): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
  return schema.parse(body);
}

/** Reject cross-site state-changing requests (cookie auth is otherwise CSRF-prone). */
function assertSameOrigin(req: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return;
  if (req.headers.get("sec-fetch-site") === "cross-site") throw new HttpError(403, "Cross-site request blocked.");
  const origin = req.headers.get("origin");
  if (!origin) return;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    /* handled below */
  }
  if (originHost !== host) throw new HttpError(403, "Cross-site request blocked.");
}

/** Require a valid admin session whose account still exists. */
export async function requireAdmin(req: Request): Promise<Session> {
  assertSameOrigin(req);
  const session = await verifyToken(cookies().get(COOKIE)?.value);
  if (!session) throw new HttpError(401, "Please sign in again.");
  const store = await getStore();
  if (!(await store.admins.findById(session.id)))
    throw new HttpError(401, "Account no longer exists.");
  return session;
}

export const nowIso = () => new Date().toISOString();
