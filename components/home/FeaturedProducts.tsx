import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getCategories, getProducts, getSettings } from "@/lib/data";
import Accent from "../Accent";
import ProductCard from "../ProductCard";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";

export default async function FeaturedProducts() {
  const [all, categories, site] = await Promise.all([getProducts(), getCategories(), getSettings()]);
  const h = site.home.featured;
  const featured = all.filter((p) => p.featured);
  const list = (featured.length ? featured : all).slice(0, 6);
  if (!list.length) return null;
  return (
    <section className="section bg-slate-50">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow={h.eyebrow} title={<Accent title={h.title} accent={h.accent} />} description={h.description} />
          <Reveal>
            <Link href="/products" className="btn-ghost shrink-0">
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 0.08}>
              <ProductCard product={p} categoryName={categories.find((c) => c.slug === p.category)?.name} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
