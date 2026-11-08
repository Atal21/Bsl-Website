import { handle } from "@/lib/api/http";
import { publicJson } from "@/lib/api/public";
import { getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export const GET = handle(async () => publicJson(await getCategories()));
