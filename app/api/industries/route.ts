import { handle } from "@/lib/api/http";
import { publicJson } from "@/lib/api/public";
import { getIndustries } from "@/lib/data";

export const dynamic = "force-dynamic";

export const GET = handle(async () => publicJson(await getIndustries()));
