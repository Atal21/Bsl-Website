import { crudItem } from "@/lib/api/crud";
import { productConfig } from "@/lib/api/configs";

export const dynamic = "force-dynamic";
const c = crudItem(productConfig);
export const GET = c.GET;
export const PUT = c.PUT;
export const PATCH = c.PATCH;
export const DELETE = c.DELETE;
