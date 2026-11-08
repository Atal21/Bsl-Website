import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getIndustries, getSettings } from "@/lib/data";
import Accent from "../Accent";
import Icon from "../Icon";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";

export default async function IndustriesStrip() {
  const [all, site] = await Promise.all([getIndustries(), getSettings()]);
  const main = all.slice(0, 3);
  const h = site.home.industries;
  if (!main.length) return null;
  return (
    <section className="section bg-slate-50">
      <div className="container-x">
        <SectionHeading eyebrow={h.eyebrow} title={<Accent title={h.title} accent={h.accent} />} description={h.description} />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {main.map((ind, i) => (
            <Reveal key={ind.slug} delay={i * 0.1}>
              <Link
                href={`/industries#${ind.slug}`}
                className="group relative block h-full overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-8 transition duration-500 hover:-translate-y-1 hover:border-brand/50 hover:shadow-glow"
              >
                <span className="absolute right-6 top-4 font-display text-7xl font-extrabold text-slate-900/[0.05]">0{i + 1}</span>
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-ink-900">
                  <Icon name={ind.icon} className="h-7 w-7" />
                </span>
                <h3 className="font-display-tight mt-6 text-2xl font-bold text-slate-900">{ind.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{ind.blurb}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-700">
                  Explore solutions <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
