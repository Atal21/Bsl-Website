import { NextResponse } from "next/server";
import { COOKIE } from "@/lib/auth-token";
import { handle } from "@/lib/api/http";

export const dynamic = "force-dynamic";

export const POST = handle(async () => {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: COOKIE, value: "", path: "/", maxAge: 0 });
  return res;
});
