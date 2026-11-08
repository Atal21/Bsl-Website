import { handle } from "@/lib/api/http";
import { publicJson } from "@/lib/api/public";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

// Public site details (name, contact, hero text...). Nothing private lives in settings.
export const GET = handle(async () => publicJson(await getSettings()));
