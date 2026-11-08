"use client";

import { useState } from "react";
import type { SpecTableData } from "@/lib/specs";

export default function SpecTable({ data }: { data: SpecTableData }) {
  const [tab, setTab] = useState(0);
  const group = data.groups[tab];
  const tabbed = data.groups.length > 1;

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-display-tight text-lg font-semibold text-slate-900">{data.title}</h3>
        {tabbed && (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1" role="tablist">
            {data.groups.map((g, i) => (
              <button
                key={g.label}
                role="tab"
                aria-selected={i === tab}
                onClick={() => setTab(i)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  i === tab ? "bg-brand text-ink-900" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-slate-50">
              {data.columns.map((c, i) => (
                <th
                  key={c}
                  scope="col"
                  className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-amber-700 ${
                    i === 0 ? "sticky left-0 z-10 bg-slate-100" : ""
                  }`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.rows.map((row, r) => (
              <tr key={`${row[0]}-${r}`} className="border-t border-slate-100 transition hover:bg-amber-50">
                {row.map((cell, i) => (
                  <td
                    key={i}
                    className={`whitespace-nowrap px-4 py-3 ${
                      i === 0 ? "sticky left-0 z-10 bg-white font-semibold text-slate-900" : "text-slate-700"
                    }`}
                  >
                    {typeof cell === "number" ? cell.toLocaleString("en-IN") : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.note && <p className="border-t border-slate-200 px-5 py-4 text-xs text-slate-500">{data.note}</p>}
    </div>
  );
}
