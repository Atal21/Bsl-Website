"use client";

import { Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, errMsg } from "@/lib/admin-client";
import type { Category, Product } from "@/lib/types";
import { useToast } from "./feedback";
import { GalleryField, ImageField } from "./ImagePicker";
import SpecEditor from "./SpecEditor";
import { Field, KeyValueEditor, PageHeader, Panel, StringListEditor, Toggle } from "./ui";

type Draft = Omit<Product, "_id" | "createdAt" | "updatedAt">;

const empty = (category: string): Draft => ({
  slug: "",
  name: "",
  category,
  tagline: "",
  description: [""],
  image: "",
  gallery: [],
  fit: "auto",
  highlights: [],
  features: [],
  advantages: [],
  applications: [],
  specs: null,
  featured: false,
  published: true,
  order: 0,
});

// "2000" -> 2000 so numeric columns stay numeric on the public site.
const normalizeSpecs = (s: Draft["specs"]): Draft["specs"] =>
  s && {
    ...s,
    note: s.note?.trim() || undefined,
    groups: s.groups.map((g) => ({
      label: g.label?.trim() || undefined,
      rows: g.rows.map((r) => r.map((c) => (typeof c === "string" && c.trim() !== "" && /^-?\d+(\.\d+)?$/.test(c.trim()) ? Number(c) : c))),
    })),
  };

export default function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter();
  const toast = useToast();
  const [d, setD] = useState<Draft>(() => {
    if (!product) return empty(categories[0]?.slug ?? "");
    const { _id, createdAt, updatedAt, ...rest } = product;
    void _id; void createdAt; void updatedAt;
    return { ...rest, description: rest.description.length ? rest.description : [""] };
  });
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((cur) => ({ ...cur, [k]: v }));
  const clean = (l: string[]) => l.map((x) => x.trim()).filter(Boolean);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const body: Draft = {
      ...d,
      description: clean(d.description),
      features: clean(d.features),
      advantages: clean(d.advantages),
      applications: clean(d.applications),
      highlights: d.highlights.filter((h) => h.label.trim() && h.value.trim()),
      specs: normalizeSpecs(d.specs),
    };
    try {
      if (product) {
        await api(`/api/admin/products/${product._id}`, { method: "PUT", body });
        toast.success("Product saved");
        router.refresh();
      } else {
        await api("/api/admin/products", { body });
        toast.success("Product created");
        router.push("/admin/products");
        router.refresh();
      }
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save}>
      <PageHeader title={product ? `Edit: ${product.name}` : "New product"} description="Fill in what you have — empty sections are simply hidden on the product page.">
        <Link href="/admin/products" className="abtn-ghost">
          Back
        </Link>
        <button className="abtn-primary" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name *">
                <input className="input" required value={d.name} onChange={(e) => set("name", e.target.value)} />
              </Field>
              <Field label="URL slug" hint="Leave empty to generate from the name.">
                <input className="input" value={d.slug} onChange={(e) => set("slug", e.target.value)} placeholder="hydraulic-scissor-lift" />
              </Field>
              <Field label="Category *">
                <select className="input" required value={d.category} onChange={(e) => set("category", e.target.value)}>
                  {categories.map((c) => (
                    <option key={c._id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tagline">
                <input className="input" value={d.tagline} onChange={(e) => set("tagline", e.target.value)} />
              </Field>
            </div>
            <div className="mt-5">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Description paragraphs</span>
              <StringListEditor multiline value={d.description} onChange={(v) => set("description", v)} addLabel="Add paragraph" />
            </div>
          </Panel>

          <Panel title="Highlights" description="Short label/value facts shown as chips (e.g. Capacity — 1–5 tons).">
            <KeyValueEditor value={d.highlights} onChange={(v) => set("highlights", v)} />
          </Panel>

          <Panel title="Features, advantages & applications">
            <div className="space-y-5">
              <div>
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Features</span>
                <StringListEditor value={d.features} onChange={(v) => set("features", v)} />
              </div>
              <div>
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Advantages</span>
                <StringListEditor value={d.advantages} onChange={(v) => set("advantages", v)} />
              </div>
              <div>
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Applications</span>
                <StringListEditor value={d.applications} onChange={(v) => set("applications", v)} />
              </div>
            </div>
          </Panel>

          <Panel title="Specification table" description="Model chart displayed on the product page.">
            <SpecEditor value={d.specs} onChange={(v) => set("specs", v)} />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Visibility">
            <div className="space-y-4">
              <Toggle checked={d.published} onChange={(v) => set("published", v)} label="Published" hint="Hidden from the website when off." />
              <Toggle checked={d.featured} onChange={(v) => set("featured", v)} label="Featured" hint="Shown in the home page highlights." />
              <Field label="Sort order" hint="Lower numbers appear first.">
                <input className="input" type="number" min={0} value={d.order} onChange={(e) => set("order", Number(e.target.value) || 0)} />
              </Field>
            </div>
          </Panel>

          <Panel title="Images">
            <div className="space-y-5">
              <ImageField label="Main image" value={d.image} onChange={(v) => set("image", v)} />
              <Field label="Image fit" hint="Contain shows the whole photo; cover fills the frame.">
                <select className="input" value={d.fit} onChange={(e) => set("fit", e.target.value as Draft["fit"])}>
                  <option value="auto">Auto</option>
                  <option value="contain">Contain (show full image)</option>
                  <option value="cover">Cover (fill frame)</option>
                </select>
              </Field>
              <div>
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Gallery</span>
                <GalleryField value={d.gallery} onChange={(v) => set("gallery", v)} />
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </form>
  );
}
