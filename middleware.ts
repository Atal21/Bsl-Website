import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verifyToken } from "@/lib/auth-token";

// Guards the admin pages and admin API. (Every admin API handler re-checks the session too.)
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const isLogin = pathname === "/admin/login" || pathname === "/api/admin/auth/login";
  const session = await verifyToken(req.cookies.get(COOKIE)?.value);

  if (isLogin) {
    if (session && pathname === "/admin/login") return NextResponse.redirect(new URL("/admin", req.url));
    return NextResponse.next();
  }
  if (session) return NextResponse.next();

  if (isApi) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const url = new URL("/admin/login", req.url);
  if (pathname !== "/admin") url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
