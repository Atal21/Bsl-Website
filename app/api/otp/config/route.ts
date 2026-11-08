import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export const GET = () => NextResponse.json({ enabled: env.otpEnabled() });
