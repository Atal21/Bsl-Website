import { crudCollection } from "@/lib/api/crud";
import { categoryConfig } from "@/lib/api/configs";

export const dynamic = "force-dynamic";
const c = crudCollection(categoryConfig);
export const GET = c.GET;
export const POST = c.POST;
