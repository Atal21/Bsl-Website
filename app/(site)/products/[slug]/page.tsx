import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CTASection from "@/components/CTASection";
import ProductCard from "@/components/ProductCard";
import ProductDetail from "@/components/ProductDetail";
import Reveal from "@/components/Reveal";
import { getCategories, getProduct, getProducts, getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/site";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct(params.slug);
  if (!p) return {};
  return {
    title: p.name,
    description: `${p.tagline} ${p.description[0] ?? ""}`.trim().slice(0, 300),
    openGraph: p.image ? { images: [{ url: p.image }] } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const [product, products, categories, site] = await Promise.all([getProduct(params.slug), getProducts(), getCategories(), getSettings()]);
  if (!product) notFound();

  const category = categories.find((c) => c.slug === product.category);
  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name;
  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug);
  const more = related.length >= 3 ? related.slice(0, 3) : [...related, ...products.filter((p) => p.category !== product.category)].slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description.join(" "),
    image: product.image ? (product.image.startsWith("http") ? product.image : `${siteUrl(site)}${product.image}`) : undefined,
    brand: { "@type": "Brand", name: site.name },
    category: category?.name,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ProductDetail initial={product} categoryName={category?.name ?? ""} />

      <section className="section border-t border-slate-200 bg-slate-50">
        <div className="container-x">
          <Reveal>
            <span className="eyebrow">You may also like</span>
            <h2 className="font-display-tight mt-3 text-3xl font-bold text-slate-900">Related products</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => (
              <ProductCard key={p.slug} product={p} categoryName={catName(p.category)} />
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
