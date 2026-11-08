import { Check } from "lucide-react";
import Image from "next/image";
import CTASection from "@/components/CTASection";
import Icon from "@/components/Icon";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import Accent, { hasText } from "@/components/Accent";
import { getCategories, getSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { FALLBACK_LOGO } from "@/lib/site";

export const generateMetadata = () => pageMetadata((p) => p.about, "About Us");

export default async function AboutPage() {
  const [site, categories] = await Promise.all([getSettings(), getCategories()]);
  const pg = site.pages.about;
  const ab = site.about;
  const strengths = site.home.whyUs.items;
  return (
    <>
      <PageHero eyebrow={pg.eyebrow} title={<Accent title={pg.title} accent={pg.accent} />} description={pg.description} crumbs={[{ label: "About" }]} />

      {/* story */}
      <section className="section">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <div className="relative mx-auto aspect-square max-w-md">
              <div aria-hidden className="absolute inset-0 rounded-full bg-brand/20 blur-[80px]" />
              <Image
                src={site.logo || FALLBACK_LOGO}
                alt={`${site.name} logo`}
                fill
                sizes="(min-width:1024px) 28rem, 80vw"
                className="rounded-full object-contain shadow-glow"
              />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            {ab.storyHeading.eyebrow && <span className="eyebrow">{ab.storyHeading.eyebrow}</span>}
            <h2 className="font-display-tight mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              <Accent title={ab.storyHeading.title} accent={ab.storyHeading.accent} />
            </h2>
            <div className="mt-6 space-y-4 leading-relaxed text-slate-700">
              {ab.story.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {ab.commitments.map((c) => (
                <li key={c} className="flex gap-3 text-sm text-slate-700">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/15 text-amber-700">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* mission & vision */}
      <section className="section bg-slate-50">
        <div className="container-x grid gap-6 md:grid-cols-2">
          {[
            { icon: "target" as const, title: "Our Mission", text: ab.mission },
            { icon: "eye" as const, title: "Our Vision", text: ab.vision },
          ]
            .filter((m) => m.text)
            .map((m, i) => (
            <Reveal key={m.title} delay={i * 0.1}>
              <div className="card relative h-full overflow-hidden p-8 sm:p-10">
                <div className="hazard absolute inset-x-0 top-0" />
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-ink-900">
                  <Icon name={m.icon} className="h-7 w-7" />
                </span>
                <h2 className="font-display-tight mt-6 text-2xl font-bold text-slate-900">{m.title}</h2>
                <p className="mt-4 leading-relaxed text-slate-700">{m.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* values */}
      {strengths.length > 0 && (
      <section className="section">
        <div className="container-x">
          {hasText(ab.values) && <SectionHeading eyebrow={ab.values.eyebrow} align="center" title={<Accent title={ab.values.title} accent={ab.values.accent} />} description={ab.values.description} />}
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {strengths.map((s, i) => (
              <Reveal key={s.title} delay={(i % 3) * 0.08}>
                <div className="card h-full p-7">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-amber-700">
                    <Icon name={s.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="font-display-tight mt-5 text-lg font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* offering */}
      <section className="section bg-slate-50">
        <div className="container-x">
          {hasText(ab.range) && <SectionHeading eyebrow={ab.range.eyebrow} title={<Accent title={ab.range.title} accent={ab.range.accent} />} description={ab.range.description} />}
          <div className="mt-10 flex flex-wrap gap-3">
            {categories.map((c) => (
              <span key={c.slug} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-900">
                <Icon name={c.icon} className="h-4 w-4 text-amber-700" /> {c.name}
              </span>
            ))}
            {ab.customLabel && (
              <span className="flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-5 py-2.5 text-sm font-medium text-amber-700">
                <Icon name="wrench" className="h-4 w-4" /> {ab.customLabel}
              </span>
            )}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
