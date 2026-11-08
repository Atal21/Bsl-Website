import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSettings().catch(() => null);
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin"] }],
    sitemap: `${siteUrl(site ?? undefined)}/sitemap.xml`,
  };
}
