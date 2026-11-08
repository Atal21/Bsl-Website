"use client";

import Image from "next/image";
import Link from "next/link";
import { FALLBACK_LOGO } from "@/lib/site";
import { useSite } from "./SiteProvider";

type Props = { size?: number; showText?: boolean; className?: string; dark?: boolean };

/** Circular logo + company name, both editable in Admin → Site settings. */
export default function Logo({ size = 52, showText = true, className = "", dark = false }: Props) {
  const site = useSite();
  return (
    <Link href="/" aria-label={`${site.name} – home`} className={`group flex items-center gap-3 ${className}`}>
      <span className="relative shrink-0 transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-105">
        <Image
          src={site.logo || FALLBACK_LOGO}
          alt={`${site.name} logo`}
          width={size}
          height={size}
          priority
          className="rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_8px_30px_-8px_rgba(255,214,10,0.45)]"
        />
      </span>
      {showText && (
        <span className="leading-tight">
          <span className={`font-display-tight block text-lg font-bold uppercase tracking-wide ${dark ? "text-white" : "text-slate-900"} sm:text-xl`}>
            {site.name}
          </span>
          {site.tagline && (
            <span className={`block text-[11px] font-semibold tracking-[0.18em] ${dark ? "text-brand" : "text-amber-700"} sm:text-xs`}>
              {site.tagline}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
