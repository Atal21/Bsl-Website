"use client";

import { createContext, useContext } from "react";
import { useLive } from "@/lib/use-live";
import { emptySettings, mergeSettings } from "@/lib/site";
import type { SiteSettings } from "@/lib/types";

const SiteContext = createContext<SiteSettings>(emptySettings);

/** Live site settings for client components (navbar, logo, WhatsApp button...): server value first, then /api/settings. */
export function SiteProvider({ value, children }: { value: SiteSettings; children: React.ReactNode }) {
  const live = useLive<SiteSettings, Partial<SiteSettings>>("/api/settings", value, (j) => mergeSettings(j));
  return <SiteContext.Provider value={live}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);
