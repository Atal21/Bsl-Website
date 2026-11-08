"use client";

import { Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { api, errMsg } from "@/lib/admin-client";
import type { Category, Product } from "@/lib/types";
import { useConfirm, useToast } from "./feedback";
import { Badge, EmptyState, PageHeader } from "./ui";

export default function ProductsManager({ initial, categories }: { initial: Product[]; categories: Category[] }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState(initial);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  const shown = useMemo(
    () => items.filter((p) => (!cat || p.category === cat) && (!q || `${p.name} ${p.tagline}`.toLowerCase().includes(q.toLowerCase()))),
    [items, q, cat],
  );

  async function patch(p: Product, change: Partial<Pick<Product, "featured" | "published">>) {
    try {
      const updated = await api<Product>(`/api/admin/products/${p._id}`, { method: "PATCH", body: change });
      setItems((cur) => cur.map((x) => (x._id === p._id ? updated : x)));
    } catch (e) {
      toast.error(errMsg(e));
    }
  }

  async function remove(p: Product) {
    if (!(await confirm({ title: `Delete "${p.name}"?`, message: "It will be removed from the website and from any industry that lists it.", confirmLabel: "Delete", danger: true }))) return;
    try {
      await api(`/api/admin/products/${p._id}`, { method: "DELETE" });
      setItems((cur) => cur.filter((x) => x._id !== p._id));
      toast.success("Product deleted");
    } catch (e) {
      toast.error(errMsg(e));
    }
  }

  return (
    <>
      <PageHeader title="Products" description="Everything shown in the catalogue. Unpublished products are hidden from the website.">
        <Link href="/admin/products/new" className="abtn-primary">
          <Plus className="h-4 w-4" /> New product
        </Link>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input !py-2.5 pl-9" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input !py-2.5 sm:w-60" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {shown.length === 0 ? (
        <EmptyState title="No products found" text="Try a different search, or add a new product." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {shown.map((p) => (
              <li key={p._id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap">
                <div className="grid h-14 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="h-full w-full object-contain" loading="lazy" />
                  ) : (
                    <span className="text-[10px] text-slate-400">No image</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/products/${p._id}`} className="block truncate font-semibold text-slate-900 hover:text-amber-700">
                    {p.name}
                  </Link>
                  <p className="truncate text-xs text-slate-500">{catName(p.category)} · /{p.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => patch(p, { featured: !p.featured })}
                    aria-label={p.featured ? "Remove from featured" : "Mark as featured"}
                    title={p.featured ? "Featured on home page" : "Not featured"}
                    className={`abtn-icon ${p.featured ? "!text-amber-500" : ""}`}
                  >
                    <Star className="h-4 w-4" fill={p.featured ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => patch(p, { published: !p.published })} title="Click to toggle visibility">
                    <Badge tone={p.published ? "green" : "slate"}>{p.published ? "Published" : "Draft"}</Badge>
                  </button>
                  <Link href={`/admin/products/${p._id}`} className="abtn-icon" aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button onClick={() => remove(p)} className="abtn-icon hover:!bg-red-50 hover:!text-red-600" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
