import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getCategories, getProducts, getSettings } from "@/lib/data";
import { PLACEHOLDER_IMG, resolveFit } from "@/lib/fit";
import Accent, { hasText } from "../Accent";
import Icon from "../Icon";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";

export default async function Categories() {
  const [categories, products, site] = await Promise.all([getCategories(), getProducts(), getSettings()]);
  if (!categories.length) return null;
  const h = site.home.categories;
  return (
    <section className="section">
      <div className="container-x">
        {hasText(h) && <SectionHeading eyebrow={h.eyebrow} title={<Accent title={h.title} accent={h.accent} />} description={h.description} />}

        <div className="mt-14 grid gap-5 md:grid-cols-6">
          {categories.map((c, i) => {
            const count = products.filter((p) => p.category === c.slug).length;
            const big = i < 2;
            return (
              <Reveal key={c.slug} delay={i * 0.07} className={big ? "md:col-span-3" : "md:col-span-2"}>
                <Link
                  href={`/products?category=${c.slug}`}
                  className="group relative block h-full min-h-[18rem] overflow-hidden rounded-3xl border border-white/10 bg-ink-800 transition duration-500 hover:border-brand/50 hover:shadow-glow"
                >
                  <Image
                    src={c.image || PLACEHOLDER_IMG}
                    alt={c.name}
                    fill
                    sizes="(min-width:768px) 50vw, 100vw"
                    className={`transition duration-700 group-hover:scale-110 ${
                      resolveFit(c.image || PLACEHOLDER_IMG) === "contain" ? "bg-white object-contain p-8" : "object-cover"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-brand text-ink-900">
                      <Icon name={c.icon} className="h-5 w-5" />
                    </span>
                    <h3 className="font-display-tight text-xl font-bold text-white sm:text-2xl">{c.name}</h3>
                    <p className="mt-1 max-w-sm text-sm text-slate-300">{c.blurb}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                      {count} product{count > 1 ? "s" : ""}
                      <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
