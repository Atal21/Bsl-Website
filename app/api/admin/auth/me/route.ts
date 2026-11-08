import { handle, ok, requireAdmin } from "@/lib/api/http";

export const dynamic = "force-dynamic";

export const GET = handle(async (req) => ok(await requireAdmin(req)));
