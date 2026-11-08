"use client";

import { Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { api, ApiError, errMsg, fmtBytes } from "@/lib/admin-client";
import type { MediaItem } from "@/lib/types";
import { useConfirm, useToast } from "./feedback";
import { UrlImport, uploadFiles } from "./ImagePicker";
import { EmptyState, PageHeader } from "./ui";

export default function MediaManager({ initial }: { initial: MediaItem[] }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const saved = await uploadFiles(files);
      setItems((c) => [...saved, ...c]);
      toast.success(`${saved.length} image${saved.length > 1 ? "s" : ""} uploaded`);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function saveAlt(m: MediaItem, alt: string) {
    if (alt === m.alt) return;
    try {
      const u = await api<MediaItem>(`/api/admin/media/${m._id}`, { method: "PATCH", body: { alt } });
      setItems((c) => c.map((x) => (x._id === u._id ? u : x)));
      toast.success("Alt text saved");
    } catch (e) {
      toast.error(errMsg(e));
    }
  }

  async function remove(m: MediaItem) {
    if (!(await confirm({ title: "Delete this image?", message: m.filename, confirmLabel: "Delete", danger: true }))) return;
    try {
      await api(`/api/admin/media/${m._id}`, { method: "DELETE" });
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        const usage = ((e.details as { usage?: string[] } | undefined)?.usage ?? []).join(", ");
        if (!(await confirm({ title: "Image is in use", message: `Used by: ${usage}. Deleting it will leave broken images there.`, confirmLabel: "Delete anyway", danger: true }))) return;
        try {
          await api(`/api/admin/media/${m._id}?force=1`, { method: "DELETE" });
        } catch (e2) {
          toast.error(errMsg(e2));
          return;
        }
      } else {
        toast.error(errMsg(e));
        return;
      }
    }
    setItems((c) => c.filter((x) => x._id !== m._id));
    toast.success("Image deleted");
  }

  return (
    <>
      <PageHeader title="Media library" description="Upload product and category photos. Images are optimised automatically (WebP, max 1800 px).">
        <button className="abtn-primary" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload images
        </button>
        <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => onFiles(e.target.files)} />
      </PageHeader>

      <div className="mb-5 max-w-2xl">
        <UrlImport onImported={(m) => setItems((c) => [m, ...c])} />
      </div>

      {items.length === 0 ? (
        <EmptyState title="No images yet" text="Upload JPG, PNG, WebP or AVIF files up to 8 MB each." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <div key={m._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="grid aspect-[4/3] place-items-center bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.alt || m.filename} className="h-full w-full object-contain" loading="lazy" />
              </div>
              <div className="space-y-2 p-3">
                <p className="truncate text-sm font-medium text-slate-800" title={m.filename}>{m.filename}</p>
                <p className="text-xs text-slate-500">{m.width}×{m.height} · {fmtBytes(m.size)}</p>
                <input
                  className="input !rounded-lg !px-2.5 !py-1.5 !text-xs"
                  defaultValue={m.alt}
                  placeholder="Alt text (describe the image)"
                  onBlur={(e) => saveAlt(m, e.target.value.trim())}
                />
                <div className="flex gap-2">
                  <button className="abtn-ghost !py-1 !text-xs" onClick={() => navigator.clipboard?.writeText(location.origin + m.url).then(() => toast.info("Link copied"))}>Copy link</button>
                  <button className="abtn-danger !py-1" aria-label="Delete" onClick={() => remove(m)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
