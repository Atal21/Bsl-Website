import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Accent from "@/components/Accent";
import CTASection from "@/components/CTASection";
import Icon from "@/components/Icon";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { getIndustries, getProducts, getSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { resolveFit } from "@/lib/fit";

export const generateMetadata = () => pageMetadata((p) => p.industries, "Industries");

export default async function IndustriesPage() {
  const [industries, products, site] = await Promise.all([getIndustries(), getProducts(), getSettings()]);
  const pg = site.pages.industries;
  return (
    <>
      <PageHero eyebrow={pg.eyebrow} title={<Accent title={pg.title} accent={pg.accent} />} description={pg.description} crumbs={[{ label: "Industries" }]} />

      <section className="section">
        <div className="container-x space-y-10">
          {industries.map((ind, i) => {
            const items = ind.products.map((s) => products.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => Boolean(p));
            return (
              <Reveal key={ind.slug}>
                <article id={ind.slug} className="card scroll-mt-28 overflow-hidden">
                  <div className="grid lg:grid-cols-[1fr_1.2fr]">
                    <div className={`relative p-8 sm:p-10 ${i % 2 ? "lg:order-2" : ""}`}>
                      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-ink-900">
                        <Icon name={ind.icon} className="h-7 w-7" />
                      </span>
                      <h2 className="font-display-tight mt-6 text-3xl font-bold text-slate-900">{ind.name}</h2>
                      <p className="mt-4 leading-relaxed text-slate-600">{ind.blurb}</p>
                      <ul className="mt-6 space-y-3">
                        {ind.needs.map((n) => (
                          <li key={n} className="flex gap-3 text-sm text-slate-700">
                            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/15 text-amber-700">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                            {n}
                          </li>
                        ))}
                      </ul>
                      <Link href="/contact" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-amber-700">
                        Discuss your requirement <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-5 sm:p-8">
                      {items.slice(0, 4).map((p) => (
                        <Link
                          key={p.slug}
                          href={`/products/${p.slug}`}
                          className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-brand/50"
                        >
                          <div className="relative aspect-[4/3] bg-white">
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              sizes="(min-width:1024px) 20vw, 45vw"
                              className={`transition duration-500 group-hover:scale-105 ${
                                resolveFit(p.image, p.fit) === "contain" ? "object-contain p-3" : "object-cover"
                              }`}
                            />
                          </div>
                          <p className="p-3 text-xs font-semibold leading-snug text-slate-900 transition group-hover:text-amber-700">{p.name}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      <CTASection />
    </>
  );
}
