"use client";

import { ArrowLeft, Check, Download, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { useLive } from "@/lib/use-live";
import { telHref, whatsappHref } from "@/lib/site";
import type { Product } from "@/lib/types";
import ProductGallery from "./ProductGallery";
import Reveal from "./Reveal";
import { useSite } from "./SiteProvider";
import SpecTable from "./SpecTable";

/** Product page body: server-rendered first (SEO), then refreshed from GET /api/products/<slug>. */
export default function ProductDetail({ initial, categoryName }: { initial: Product; categoryName: string }) {
  const product = useLive<Product>(`/api/products/${initial.slug}`, initial);
  const site = useSite();
  const category = { name: categoryName };

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-32 sm:pt-40">
        <div aria-hidden className="grid-bg absolute inset-0" />
        <div aria-hidden className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-brand/10 blur-[110px]" />

        <div className="container-x relative">
          <Link href="/products" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-amber-700">
            <ArrowLeft className="h-4 w-4" /> All products
          </Link>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <ProductGallery images={product.gallery.length ? product.gallery : product.image ? [product.image] : []} name={product.name} fitMode={product.fit} />
            </Reveal>

            <Reveal delay={0.1}>
              <Link
                href={`/products?category=${product.category}`}
                className="inline-block rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-700 transition hover:bg-brand hover:text-ink-900"
              >
                {category?.name}
              </Link>
              <h1 className="font-display-tight mt-5 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {product.name}
              </h1>
              <p className="mt-4 text-lg text-amber-700">{product.tagline}</p>

              <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-700">
                {product.description.map((d) => (
                  <p key={d}>{d}</p>
                ))}
              </div>

              <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {product.highlights.map((h) => (
                  <div key={h.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{h.label}</dt>
                    <dd className="mt-1 font-display text-base font-bold text-slate-900">{h.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/contact?product=${encodeURIComponent(product.name)}`} className="btn-primary">
                  Request a Quote
                </Link>
                <a
                  href={whatsappHref(site, `Hello ${site.name}, I would like a quotation for: ${product.name}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  <MessageCircle className="h-4 w-4 text-[#25D366]" /> WhatsApp
                </a>
                <a href={telHref(site)} className="btn-ghost">
                  <Phone className="h-4 w-4 text-amber-700" /> Call
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* features / advantages / applications */}
      <section className="pb-16">
        <div className="container-x grid gap-5 md:grid-cols-3">
          {product.features.length > 0 && <ListCard title="Key features" items={product.features} />}
          {product.advantages.length > 0 && <ListCard title="Advantages" items={product.advantages} />}
          {product.applications.length > 0 && <ListCard title="Applications" items={product.applications} />}
        </div>
      </section>

      {product.specs && (
        <section className="pb-20">
          <div className="container-x">
            <Reveal>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="eyebrow">Technical data</span>
                  <h2 className="font-display-tight mt-3 text-3xl font-bold text-slate-900">Specifications</h2>
                </div>
                {site.catalogPdf && (
                  <a href={site.catalogPdf} download className="btn-ghost !py-2.5">
                    <Download className="h-4 w-4 text-amber-700" /> Full catalogue
                  </a>
                )}
              </div>
              <SpecTable data={product.specs} />
            </Reveal>
          </div>
        </section>
      )}

    </>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Reveal>
      <div className="card h-full p-7">
        <h2 className="font-display-tight text-xl font-semibold text-slate-900">{title}</h2>
        <ul className="mt-5 space-y-3">
          {items.map((it) => (
            <li key={it} className="flex gap-3 text-sm leading-relaxed text-slate-700">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/15 text-amber-700">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              {it}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
