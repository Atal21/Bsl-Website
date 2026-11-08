import { crudCollection } from "@/lib/api/crud";
import { industryConfig } from "@/lib/api/configs";

export const dynamic = "force-dynamic";
const c = crudCollection(industryConfig);
export const GET = c.GET;
export const POST = c.POST;
