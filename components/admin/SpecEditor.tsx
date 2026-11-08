"use client";

import { Plus, X } from "lucide-react";
import type { SpecTableData } from "@/lib/types";
import { Field } from "./ui";

const blank = (): SpecTableData => ({ title: "Specifications", columns: ["Model", "Capacity"], groups: [{ rows: [["", ""]] }], note: "" });

/** Editor for a product's model/specification table. */
export default function SpecEditor({ value, onChange }: { value: SpecTableData | null; onChange: (v: SpecTableData | null) => void }) {
  if (!value) {
    return (
      <button type="button" className="abtn-ghost" onClick={() => onChange(blank())}>
        <Plus className="h-4 w-4" /> Add specification table
      </button>
    );
  }
  const set = (patch: Partial<SpecTableData>) => onChange({ ...value, ...patch });
  const cols = value.columns;

  const setCols = (columns: string[]) =>
    set({
      columns,
      groups: value.groups.map((g) => ({ ...g, rows: g.rows.map((r) => Array.from({ length: columns.length }, (_, i) => r[i] ?? "")) })),
    });

  const setGroup = (gi: number, patch: Partial<SpecTableData["groups"][number]>) =>
    set({ groups: value.groups.map((g, i) => (i === gi ? { ...g, ...patch } : g)) });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Table title">
          <input className="input" value={value.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <Field label="Note (shown under the table)">
          <input className="input" value={value.note ?? ""} onChange={(e) => set({ note: e.target.value })} />
        </Field>
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Columns</span>
        <div className="flex flex-wrap gap-2">
          {cols.map((c, i) => (
            <div key={i} className="flex items-center gap-1">
              <input className="input !w-40 !py-2" value={c} onChange={(e) => setCols(cols.map((x, j) => (j === i ? e.target.value : x)))} />
              {cols.length > 1 && (
                <button type="button" aria-label="Remove column" className="abtn-icon hover:!text-red-600" onClick={() => setCols(cols.filter((_, j) => j !== i))}>
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {cols.length < 20 && (
            <button type="button" className="abtn-ghost !py-2" onClick={() => setCols([...cols, `Column ${cols.length + 1}`])}>
              <Plus className="h-4 w-4" /> Column
            </button>
          )}
        </div>
      </div>

      {value.groups.map((g, gi) => (
        <div key={gi} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <div className="mb-3 flex items-center gap-2">
            <input className="input !py-2" placeholder="Group label (optional, e.g. Single Scissor)" value={g.label ?? ""} onChange={(e) => setGroup(gi, { label: e.target.value })} />
            {value.groups.length > 1 && (
              <button type="button" className="abtn-danger !py-2 shrink-0" onClick={() => set({ groups: value.groups.filter((_, i) => i !== gi) })}>
                Remove group
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-separate border-spacing-1 text-sm">
              <thead>
                <tr>
                  {cols.map((c, i) => (
                    <th key={i} className="px-1 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {c || "—"}
                    </th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {g.rows.map((row, ri) => (
                  <tr key={ri}>
                    {cols.map((_, ci) => (
                      <td key={ci}>
                        <input
                          className="input !w-36 !rounded-lg !px-2.5 !py-1.5"
                          value={String(row[ci] ?? "")}
                          onChange={(e) => {
                            const rows = g.rows.map((r, i) => (i === ri ? cols.map((__, k) => (k === ci ? e.target.value : (r[k] ?? ""))) : r));
                            setGroup(gi, { rows });
                          }}
                        />
                      </td>
                    ))}
                    <td>
                      <button type="button" aria-label="Remove row" className="abtn-icon hover:!text-red-600" onClick={() => setGroup(gi, { rows: g.rows.filter((_, i) => i !== ri) })}>
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="abtn-ghost mt-2 !py-1.5" onClick={() => setGroup(gi, { rows: [...g.rows, cols.map(() => "")] })}>
            <Plus className="h-4 w-4" /> Row
          </button>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        {value.groups.length < 12 && (
          <button type="button" className="abtn-ghost" onClick={() => set({ groups: [...value.groups, { rows: [cols.map(() => "")] }] })}>
            <Plus className="h-4 w-4" /> Add group
          </button>
        )}
        <button type="button" className="abtn-danger" onClick={() => onChange(null)}>
          Remove table
        </button>
      </div>
      <p className="text-xs text-slate-400">Numbers are stored as typed; plain digits (e.g. 2000) are saved as numbers automatically.</p>
    </div>
  );
}
