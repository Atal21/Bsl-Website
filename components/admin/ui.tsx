"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { useEffect } from "react";

/* ---------- layout ---------- */

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-slate-600">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Panel({ title, description, children, className = "" }: { title?: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {title && (
        <header className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-display text-base font-bold text-slate-900">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function EmptyState({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <p className="font-display text-lg font-semibold text-slate-900">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{text}</p>}
      {children && <div className="mt-5 flex justify-center">{children}</div>}
    </div>
  );
}

const tones = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  red: "bg-red-50 text-red-700 ring-red-200",
};
export function Badge({ tone = "slate", children }: { tone?: keyof typeof tones; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${tones[tone]}`}>{children}</span>;
}

/* ---------- modal ---------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  const width = { md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" }[size];
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-6" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className={`flex max-h-[92vh] w-full ${width} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`}
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="abtn-icon">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">{footer}</footer>}
      </div>
    </div>
  );
}

/* ---------- form controls ---------- */

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-amber-500" : "bg-slate-300"}`}
      >
        <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "translate-x-5" : ""}`} />
      </button>
      <span>
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </span>
    </label>
  );
}

const move = <T,>(arr: T[], i: number, d: number) => {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

/** Editable list of text lines (features, applications, paragraphs…). */
export function StringListEditor({
  value,
  onChange,
  placeholder = "",
  multiline = false,
  addLabel = "Add item",
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  multiline?: boolean;
  addLabel?: string;
}) {
  return (
    <div className="space-y-2">
      {value.map((v, i) => (
        <div key={i} className="flex items-start gap-2">
          {multiline ? (
            <textarea
              className="input min-h-[5rem] flex-1 resize-y"
              value={v}
              placeholder={placeholder}
              onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))}
            />
          ) : (
            <input className="input flex-1" value={v} placeholder={placeholder} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
          )}
          <div className="flex shrink-0 flex-col sm:flex-row">
            <button type="button" className="abtn-icon" aria-label="Move up" onClick={() => onChange(move(value, i, -1))}>
              <ArrowUp className="h-4 w-4" />
            </button>
            <button type="button" className="abtn-icon" aria-label="Move down" onClick={() => onChange(move(value, i, 1))}>
              <ArrowDown className="h-4 w-4" />
            </button>
            <button type="button" className="abtn-icon hover:!bg-red-50 hover:!text-red-600" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="abtn-ghost !py-1.5" onClick={() => onChange([...value, ""])}>
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  );
}

/** Label / value pairs (product highlights). */
export function KeyValueEditor({
  value,
  onChange,
  keyPlaceholder = "Label",
  valuePlaceholder = "Value",
}: {
  value: { label: string; value: string }[];
  onChange: (v: { label: string; value: string }[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}) {
  return (
    <div className="space-y-2">
      {value.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <input className="input w-2/5" value={row.label} placeholder={keyPlaceholder} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
          <input className="input flex-1" value={row.value} placeholder={valuePlaceholder} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
          <button type="button" className="abtn-icon hover:!bg-red-50 hover:!text-red-600" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))}>
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button type="button" className="abtn-ghost !py-1.5" onClick={() => onChange([...value, { label: "", value: "" }])}>
        <Plus className="h-4 w-4" /> Add highlight
      </button>
    </div>
  );
}
