import { crudItem } from "@/lib/api/crud";
import { industryConfig } from "@/lib/api/configs";

export const dynamic = "force-dynamic";
const c = crudItem(industryConfig);
export const GET = c.GET;
export const PUT = c.PUT;
export const PATCH = c.PATCH;
export const DELETE = c.DELETE;
