import Accent from "@/components/Accent";
import CTASection from "@/components/CTASection";
import PageHero from "@/components/PageHero";
import ProductsExplorer from "@/components/ProductsExplorer";
import { getCategories, getProducts, getSettings, summarizeProduct } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata((p) => p.products, "Products");

export default async function ProductsPage({ searchParams }: { searchParams: { category?: string } }) {
  const [products, categories, site] = await Promise.all([getProducts(), getCategories(), getSettings()]);
  const pg = site.pages.products;
  const requested = searchParams.category;
  const initial = categories.some((c) => c.slug === requested) ? (requested as string) : "all";

  return (
    <>
      <PageHero eyebrow={pg.eyebrow} title={<Accent title={pg.title} accent={pg.accent} />} description={pg.description} crumbs={[{ label: "Products" }]} />
      <section className="section">
        <div className="container-x">
          <ProductsExplorer key={initial} products={products.map(summarizeProduct)} categories={categories} initialCategory={initial} />
        </div>
      </section>
      <CTASection />
    </>
  );
}
