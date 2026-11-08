"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PackageSearch, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useLive } from "@/lib/use-live";
import type { Category, ProductSummary } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function ProductsExplorer({
  products: initialProducts,
  categories: initialCategories,
  initialCategory = "all",
}: {
  products: ProductSummary[];
  categories: Category[];
  initialCategory?: string;
}) {
  const products = useLive<ProductSummary[], { products: ProductSummary[] }>("/api/products", initialProducts, (j) => j.products);
  const categories = useLive<Category[]>("/api/categories", initialCategories);
  const [active, setActive] = useState<string>(initialCategory);
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const okCat = active === "all" || p.category === active;
      const okQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.applications.some((a) => a.toLowerCase().includes(q));
      return okCat && okQuery;
    });
  }, [active, query, products]);

  const tabs: { slug: string; name: string; count: number }[] = [
    { slug: "all", name: "All Products", count: products.length },
    ...categories.map((c) => ({ slug: c.slug, name: c.name, count: products.filter((p) => p.category === c.slug).length })),
  ];

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.slug}
              role="tab"
              aria-selected={active === t.slug}
              onClick={() => setActive(t.slug)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                active === t.slug
                  ? "border-brand bg-brand text-ink-900 shadow-glow"
                  : "border-slate-200 bg-slate-100 text-slate-700 hover:border-brand/50 hover:text-slate-900"
              }`}
            >
              {t.name} <span className={active === t.slug ? "text-ink-900/70" : "text-slate-500"}>({t.count})</span>
            </button>
          ))}
        </div>

        <label className="relative block w-full lg:w-72">
          <span className="sr-only">Search products</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="input !rounded-full !pl-11"
          />
        </label>
      </div>

      <motion.div layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
            >
              <ProductCard product={p} categoryName={categories.find((c) => c.slug === p.category)?.name} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {list.length === 0 && (
        <div className="mt-16 flex flex-col items-center text-center">
          <PackageSearch className="h-12 w-12 text-slate-600" />
          <p className="mt-4 font-display text-xl font-semibold text-slate-900">No products found</p>
          <p className="mt-1 text-sm text-slate-600">Try a different keyword or category — or ask us for a custom lift.</p>
        </div>
      )}
    </div>
  );
}
