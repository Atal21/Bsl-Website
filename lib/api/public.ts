import { NextResponse } from "next/server";

/**
 * Read-only public API responses. The website itself renders on the server, so these endpoints
 * exist for integrations, mobile apps and for checking the data in the browser's Network tab.
 * Cached at the CDN for a minute (the admin panel purges the data cache whenever something is saved).
 */
export function publicJson(data: unknown, init: { status?: number } = {}) {
  return NextResponse.json(data, {
    status: init.status ?? 200,
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export function publicError(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}
