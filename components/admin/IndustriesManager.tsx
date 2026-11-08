"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { api, errMsg } from "@/lib/admin-client";
import { iconNames, type IconName } from "@/lib/icon-names";
import type { Industry, Product } from "@/lib/types";
import { useConfirm, useToast } from "./feedback";
import { Badge, EmptyState, Field, Modal, PageHeader, StringListEditor, Toggle } from "./ui";

type Draft = Omit<Industry, "_id" | "createdAt" | "updatedAt">;
const blank = (order: number): Draft => ({ name: "", slug: "", icon: "package", blurb: "", needs: [], products: [], published: true, order });

export default function IndustriesManager({ initial, products }: { initial: Industry[]; products: Pick<Product, "slug" | "name">[] }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<{ id?: string; d: Draft } | null>(null);
  const [busy, setBusy] = useState(false);
  const sorted = [...items].sort((a, b) => a.order - b.order);

  async function save() {
    if (!editing) return;
    setBusy(true);
    const body = { ...editing.d, needs: editing.d.needs.map((n) => n.trim()).filter(Boolean) };
    try {
      if (editing.id) {
        const u = await api<Industry>(`/api/admin/industries/${editing.id}`, { method: "PUT", body });
        setItems((c) => c.map((x) => (x._id === u._id ? u : x)));
      } else {
        const c = await api<Industry>("/api/admin/industries", { body });
        setItems((cur) => [...cur, c]);
      }
      toast.success("Industry saved");
      setEditing(null);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove(i: Industry) {
    if (!(await confirm({ title: `Delete "${i.name}"?`, confirmLabel: "Delete", danger: true }))) return;
    try {
      await api(`/api/admin/industries/${i._id}`, { method: "DELETE" });
      setItems((cur) => cur.filter((x) => x._id !== i._id));
      toast.success("Industry deleted");
    } catch (e) {
      toast.error(errMsg(e));
    }
  }

  const d = editing?.d;
  const set = (patch: Partial<Draft>) => setEditing((e) => e && { ...e, d: { ...e.d, ...patch } });
  const toggleProduct = (slug: string) => d && set({ products: d.products.includes(slug) ? d.products.filter((s) => s !== slug) : [...d.products, slug] });

  return (
    <>
      <PageHeader title="Industries" description="Sectors you serve, with the products recommended for each.">
        <button className="abtn-primary" onClick={() => setEditing({ d: blank(items.length) })}>
          <Plus className="h-4 w-4" /> New industry
        </button>
      </PageHeader>

      {sorted.length === 0 ? (
        <EmptyState title="No industries yet" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ul className="divide-y divide-slate-100">
            {sorted.map((i) => (
              <li key={i._id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{i.name}</p>
                  <p className="truncate text-xs text-slate-500">{i.products.length} products · {i.needs.length} needs · order {i.order}</p>
                </div>
                <Badge tone={i.published ? "green" : "slate"}>{i.published ? "Published" : "Draft"}</Badge>
                <button className="abtn-icon" aria-label="Edit" onClick={() => setEditing({ id: i._id, d: { name: i.name, slug: i.slug, icon: i.icon, blurb: i.blurb, needs: i.needs, products: i.products, published: i.published, order: i.order } })}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button className="abtn-icon hover:!bg-red-50 hover:!text-red-600" aria-label="Delete" onClick={() => remove(i)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit industry" : "New industry"}
        size="lg"
        footer={
          <>
            <button className="abtn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button className="abtn-primary" onClick={save} disabled={busy || !d?.name.trim()}>Save</button>
          </>
        }
      >
        {d && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name *"><input className="input" value={d.name} onChange={(e) => set({ name: e.target.value })} /></Field>
              <Field label="URL slug"><input className="input" value={d.slug} onChange={(e) => set({ slug: e.target.value })} /></Field>
              <Field label="Icon">
                <select className="input" value={d.icon} onChange={(e) => set({ icon: e.target.value as IconName })}>
                  {iconNames.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>
              <Field label="Sort order"><input className="input" type="number" min={0} value={d.order} onChange={(e) => set({ order: Number(e.target.value) || 0 })} /></Field>
            </div>
            <Field label="Description"><textarea className="input min-h-[5rem]" value={d.blurb} onChange={(e) => set({ blurb: e.target.value })} /></Field>
            <div>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Typical needs</span>
              <StringListEditor value={d.needs} onChange={(v) => set({ needs: v })} />
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Recommended products</span>
              <div className="grid max-h-56 gap-1 overflow-y-auto rounded-xl border border-slate-200 p-2 sm:grid-cols-2">
                {products.map((p) => (
                  <label key={p.slug} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                    <input type="checkbox" className="h-4 w-4 accent-amber-500" checked={d.products.includes(p.slug)} onChange={() => toggleProduct(p.slug)} />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>
            <Toggle checked={d.published} onChange={(v) => set({ published: v })} label="Published" />
          </div>
        )}
      </Modal>
    </>
  );
}
