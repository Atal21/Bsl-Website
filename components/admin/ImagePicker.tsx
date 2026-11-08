"use client";

import { ImagePlus, Link2, Loader2, Trash2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, errMsg } from "@/lib/admin-client";
import type { MediaItem } from "@/lib/types";
import { useToast } from "./feedback";
import { Modal } from "./ui";

/** Upload helper shared by the picker and the media library. */
export async function uploadFiles(files: FileList | File[]): Promise<MediaItem[]> {
  const form = new FormData();
  for (const f of Array.from(files)) form.append("files", f);
  return api<MediaItem[]>("/api/admin/media", { method: "POST", form });
}

/** Import an image from a link: the server downloads it and stores it like an upload (Cloudinary in production). */
export function UrlImport({ onImported }: { onImported: (m: MediaItem) => void }) {
  const toast = useToast();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!url.trim()) return;
    setBusy(true);
    try {
      const m = await api<MediaItem>("/api/admin/media/import", { body: { url } });
      setUrl("");
      onImported(m);
      toast.success("Image imported and saved to your library");
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={go} className="flex items-center gap-2">
      <div className="relative flex-1">
        <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="url"
          className="input !py-2.5 pl-9"
          placeholder="Or paste an image link  https://…/photo.jpg"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-label="Image link"
        />
      </div>
      <button className="abtn-ghost shrink-0" disabled={busy || !url.trim()}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />} Import
      </button>
    </form>
  );
}

export function MediaPicker({
  open,
  onClose,
  onPick,
  multiple = false,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (urls: string[]) => void;
  multiple?: boolean;
}) {
  const toast = useToast();
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setItems(await api<MediaItem[]>("/api/admin/media"));
    } catch (e) {
      toast.error(errMsg(e));
      setItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open) {
      setSelected([]);
      load();
    }
  }, [open, load]);

  const toggle = (url: string) =>
    setSelected((s) => (multiple ? (s.includes(url) ? s.filter((u) => u !== url) : [...s, url]) : [url]));

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const saved = await uploadFiles(files);
      setItems((cur) => [...saved, ...(cur ?? [])]);
      setSelected((s) => (multiple ? [...s, ...saved.map((m) => m.url)] : [saved[0].url]));
      toast.success(`${saved.length} image${saved.length > 1 ? "s" : ""} uploaded`);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={multiple ? "Choose images" : "Choose an image"}
      size="xl"
      footer={
        <>
          <button className="abtn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="abtn-primary"
            disabled={!selected.length}
            onClick={() => {
              onPick(selected);
              onClose();
            }}
          >
            Use {selected.length > 1 ? `${selected.length} images` : "selected"}
          </button>
        </>
      }
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Pick from your library or upload new images (JPG, PNG, WebP, AVIF · max 8 MB).</p>
        <button className="abtn-primary shrink-0" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
        </button>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
      </div>
      <div className="mb-4">
        <UrlImport
          onImported={(m) => {
            setItems((cur) => [m, ...(cur ?? [])]);
            setSelected((s) => (multiple ? [...s, m.url] : [m.url]));
          }}
        />
      </div>
      {items === null ? (
        <p className="py-16 text-center text-sm text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-500">No images yet — upload your first one.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((m) => {
            const on = selected.includes(m.url);
            return (
              <li key={m._id}>
                <button
                  type="button"
                  onClick={() => toggle(m.url)}
                  className={`group relative block aspect-square w-full overflow-hidden rounded-xl border-2 bg-slate-50 ${on ? "border-amber-500 ring-2 ring-brand/50" : "border-slate-200 hover:border-slate-400"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.alt || m.filename} className="h-full w-full object-contain" loading="lazy" />
                  {on && <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-xs font-bold text-white">✓</span>}
                </button>
                <p className="mt-1 truncate text-xs text-slate-500" title={m.filename}>
                  {m.filename}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}

/** Single image field with preview. */
export function ImageField({ value, onChange, label = "Image" }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <div className="flex items-center gap-4">
        <div className="grid h-24 w-32 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-contain" />
          ) : (
            <ImagePlus className="h-6 w-6 text-slate-300" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button type="button" className="abtn-ghost" onClick={() => setOpen(true)}>
            {value ? "Change image" : "Choose image"}
          </button>
          {value && (
            <button type="button" className="abtn-danger" onClick={() => onChange("")}>
              <Trash2 className="h-4 w-4" /> Remove
            </button>
          )}
        </div>
      </div>
      <MediaPicker open={open} onClose={() => setOpen(false)} onPick={(u) => onChange(u[0])} />
    </div>
  );
}

/** Gallery (several images, removable). */
export function GalleryField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((u, i) => (
          <div key={u + i} className="relative h-24 w-28 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-full w-full object-contain" />
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-slate-600 shadow hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setOpen(true)} className="grid h-24 w-28 place-items-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-amber-500 hover:text-amber-600">
          <span className="flex flex-col items-center gap-1 text-xs font-semibold">
            <ImagePlus className="h-5 w-5" /> Add
          </span>
        </button>
      </div>
      <MediaPicker open={open} multiple onClose={() => setOpen(false)} onPick={(u) => onChange([...value, ...u.filter((x) => !value.includes(x))])} />
    </div>
  );
}
