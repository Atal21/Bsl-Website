import { ArrowRight, ChevronDown, Download, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/data";
import { FALLBACK_LOGO } from "@/lib/site";
import Reveal from "../Reveal";

export default async function Hero() {
  const site = await getSettings();
  const h = site.hero;
  const chips = h.chips;
  const cards = site.heroCards.filter((c) => c.image).slice(0, 2);
  const stat = site.stats[0];
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden pb-20 pt-32">
      {site.heroImage && (
        <Image src={site.heroImage} alt="" fill priority sizes="100vw" className="-z-30 object-cover object-center opacity-30 grayscale" />
      )}
      <div aria-hidden className="absolute inset-0 -z-20 bg-gradient-to-r from-white via-white/90 to-white/40" />
      <div aria-hidden className="absolute inset-0 -z-20 bg-gradient-to-t from-white via-transparent to-white/70" />
      <div aria-hidden className="grid-bg absolute inset-0 -z-10" />
      <div aria-hidden className="absolute -left-40 top-1/3 -z-10 h-[30rem] w-[30rem] rounded-full bg-brand/15 blur-[130px]" />

      <div className="container-x grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <Reveal>
            {h.badge && (
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                <ShieldCheck className="h-4 w-4" /> {h.badge}
              </span>
            )}
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="font-display-tight mt-6 text-5xl font-extrabold leading-[1.05] sm:text-6xl xl:text-7xl">
              {h.accentLines.map((l) => (
                <span key={l} className="block text-amber-600">
                  {l}
                </span>
              ))}
              {h.lines.map((l) => (
                <span key={l} className="block text-slate-900">
                  {l}
                </span>
              ))}
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-slate-700 sm:text-lg">
              {h.description}
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">
                Explore Products <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="btn-ghost">
                Get a Quote
              </Link>
              {site.catalogPdf && (
                <a href={site.catalogPdf} download className="btn-ghost">
                  <Download className="h-4 w-4 text-amber-700" /> Catalogue
                </a>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <ul className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold uppercase tracking-widest text-slate-900 sm:text-sm">
              {chips.map((c, i) => (
                <li key={c} className="flex items-center gap-5">
                  {c}
                  {i < chips.length - 1 && <span className="hidden h-4 w-px bg-slate-300 sm:block" />}
                </li>
              ))}
            </ul>
            {h.servesLine && <p className="mt-4 text-sm font-semibold text-slate-600">{h.servesLine}</p>}
          </Reveal>
        </div>

        {/* floating product showcase */}
        <Reveal delay={0.25} x={40} y={0} className="relative hidden h-[34rem] lg:block">
          <div className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/20" />
          <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-100" />

          {cards[0] && (
            <div className="absolute left-4 top-4 w-60 animate-float rounded-2xl bg-white p-3 shadow-card">
              <div className="relative aspect-square">
                <Image src={cards[0].image} alt={cards[0].label} fill sizes="240px" className="object-contain" />
              </div>
              {cards[0].label && <p className="mt-2 text-center text-xs font-semibold text-ink-900">{cards[0].label}</p>}
            </div>
          )}

          {cards[1] && (
            <div className="absolute bottom-6 right-0 w-64 animate-float-slow rounded-2xl bg-white p-3 shadow-card [animation-delay:-3s]">
              <div className="relative aspect-[4/5]">
                <Image src={cards[1].image} alt={cards[1].label} fill sizes="256px" className="object-contain" />
              </div>
              {cards[1].label && <p className="mt-2 text-center text-xs font-semibold text-ink-900">{cards[1].label}</p>}
            </div>
          )}

          {(h.tagTitle || h.tagAccent) && (
            <div className="glass absolute right-10 top-10 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-card">
              <Image src={site.logo || FALLBACK_LOGO} alt="" width={44} height={44} className="rounded-full" />
              <div className="text-xs leading-tight">
                <p className="font-bold text-slate-900">{h.tagTitle}</p>
                <p className="font-bold text-amber-700">{h.tagAccent}</p>
              </div>
            </div>
          )}

          {stat && (
            <div className="glass absolute bottom-0 left-0 rounded-2xl px-5 py-4 shadow-card">
              <p className="font-display text-3xl font-extrabold text-slate-900">
                {stat.to}
                <span className="text-amber-700">{stat.suffix.trim()}</span>
              </p>
              <p className="text-xs text-slate-700">{stat.label}</p>
            </div>
          )}
        </Reveal>
      </div>

      <a
        href="#intro"
        aria-label="Scroll down"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 animate-bounce text-slate-600 transition hover:text-amber-700 sm:block"
      >
        <ChevronDown className="h-7 w-7" />
      </a>
    </section>
  );
}
