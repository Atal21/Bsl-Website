import { crudCollection } from "@/lib/api/crud";
import { productConfig } from "@/lib/api/configs";

export const dynamic = "force-dynamic";
const c = crudCollection(productConfig);
export const GET = c.GET;
export const POST = c.POST;
