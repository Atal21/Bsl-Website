import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getSettings } from "@/lib/data";
import { FALLBACK_LOGO } from "@/lib/site";
import Reveal from "./Reveal";

type Crumb = { label: string; href?: string };

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  crumbs?: Crumb[];
  children?: React.ReactNode;
};

/** Reusable inner-page banner with breadcrumbs. */
export default async function PageHero({ eyebrow, title, description, crumbs = [], children }: Props) {
  const { logo } = await getSettings();
  return (
    <section className="noise relative overflow-hidden border-b border-slate-200 pb-16 pt-36 sm:pb-20 sm:pt-44">
      <div aria-hidden className="grid-bg absolute inset-0" />
      <div aria-hidden className="absolute -top-40 right-0 h-[28rem] w-[28rem] rounded-full bg-brand/10 blur-[120px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 top-1/2 hidden h-[26rem] w-[26rem] -translate-y-1/2 bg-contain bg-no-repeat opacity-[0.06] md:block"
        style={{ backgroundImage: `url(${logo || FALLBACK_LOGO})` }}
      />
      <div className="container-x relative">
        <Reveal>
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
            <Link href="/" className="transition hover:text-amber-700">
              Home
            </Link>
            {crumbs.map((c) => (
              <span key={c.label} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" />
                {c.href ? (
                  <Link href={c.href} className="transition hover:text-amber-700">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-slate-800">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1 className="font-display-tight mt-4 max-w-4xl text-4xl font-extrabold leading-[1.1] text-slate-900 sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description && <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">{description}</p>}
          {children}
        </Reveal>
      </div>
    </section>
  );
}
