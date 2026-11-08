import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

// Liveness/readiness probe for load balancers and uptime monitors. Reveals nothing sensitive.
export async function GET() {
  try {
    const store = await getStore();
    await store.settings.count();
    return NextResponse.json({ status: "ok", db: store.kind });
  } catch (e) {
    console.error("[health]", e);
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
