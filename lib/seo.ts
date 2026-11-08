import type { Metadata } from "next";
import { getSettings } from "./data";
import type { PageCopy } from "./types";

/** Page <title>/description taken from the admin-edited page copy (falls back to the banner text). */
export async function pageMetadata(pick: (p: Awaited<ReturnType<typeof getSettings>>["pages"]) => PageCopy, fallbackTitle: string): Promise<Metadata> {
  const site = await getSettings().catch(() => null);
  if (!site) return { title: fallbackTitle };
  const p = pick(site.pages);
  return { title: p.eyebrow || fallbackTitle, description: p.meta || p.description || site.description || undefined };
}
