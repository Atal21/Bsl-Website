"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { api, errMsg } from "@/lib/admin-client";
import { iconNames, type IconName } from "@/lib/icon-names";
import type { Category } from "@/lib/types";
import { useConfirm, useToast } from "./feedback";
import { ImageField } from "./ImagePicker";
import { EmptyState, Field, Modal, PageHeader } from "./ui";

type Draft = Omit<Category, "_id" | "createdAt" | "updatedAt">;
const blank = (order: number): Draft => ({ name: "", slug: "", blurb: "", image: "", icon: "layers", order });

export default function CategoriesManager({ initial, counts }: { initial: Category[]; counts: Record<string, number> }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<{ id?: string; d: Draft } | null>(null);
  const [busy, setBusy] = useState(false);

  const sorted = [...items].sort((a, b) => a.order - b.order);

  async function save() {
    if (!editing) return;
    setBusy(true);
    try {
      if (editing.id) {
        const u = await api<Category>(`/api/admin/categories/${editing.id}`, { method: "PUT", body: editing.d });
        setItems((c) => c.map((x) => (x._id === u._id ? u : x)));
      } else {
        const c = await api<Category>("/api/admin/categories", { body: editing.d });
        setItems((cur) => [...cur, c]);
      }
      toast.success("Category saved");
      setEditing(null);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove(c: Category) {
    if (!(await confirm({ title: `Delete "${c.name}"?`, confirmLabel: "Delete", danger: true }))) return;
    try {
      await api(`/api/admin/categories/${c._id}`, { method: "DELETE" });
      setItems((cur) => cur.filter((x) => x._id !== c._id));
      toast.success("Category deleted");
    } catch (e) {
      toast.error(errMsg(e));
    }
  }

  const d = editing?.d;
  const set = (patch: Partial<Draft>) => setEditing((e) => e && { ...e, d: { ...e.d, ...patch } });

  return (
    <>
      <PageHeader title="Categories" description="Product groups shown on the home page, menu and filters.">
        <button className="abtn-primary" onClick={() => setEditing({ d: blank(items.length) })}>
          <Plus className="h-4 w-4" /> New category
        </button>
      </PageHeader>

      {sorted.length === 0 ? (
        <EmptyState title="No categories yet" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((c) => (
            <div key={c._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="grid h-36 place-items-center bg-slate-50">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt="" className="h-full w-full object-contain" loading="lazy" />
                ) : (
                  <span className="text-xs text-slate-400">No image</span>
                )}
              </div>
              <div className="p-4">
                <p className="font-display font-bold text-slate-900">{c.name}</p>
                <p className="text-xs text-slate-500">/{c.slug} · {counts[c.slug] ?? 0} products · order {c.order}</p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{c.blurb}</p>
                <div className="mt-3 flex gap-2">
                  <button className="abtn-ghost !py-1.5" onClick={() => setEditing({ id: c._id, d: { name: c.name, slug: c.slug, blurb: c.blurb, image: c.image, icon: c.icon, order: c.order } })}>
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button className="abtn-danger !py-1.5" onClick={() => remove(c)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit category" : "New category"}
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
              <Field label="URL slug" hint="Changing it updates products automatically."><input className="input" value={d.slug} onChange={(e) => set({ slug: e.target.value })} /></Field>
              <Field label="Icon">
                <select className="input" value={d.icon} onChange={(e) => set({ icon: e.target.value as IconName })}>
                  {iconNames.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>
              <Field label="Sort order"><input className="input" type="number" min={0} value={d.order} onChange={(e) => set({ order: Number(e.target.value) || 0 })} /></Field>
            </div>
            <Field label="Short description"><textarea className="input min-h-[5rem]" value={d.blurb} onChange={(e) => set({ blurb: e.target.value })} /></Field>
            <ImageField value={d.image} onChange={(v) => set({ image: v })} />
          </div>
        )}
      </Modal>
    </>
  );
}
