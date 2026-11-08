"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; type: ToastType; message: string };
type ConfirmOpts = { title: string; message?: string; confirmLabel?: string; danger?: boolean };

type Ctx = {
  toast: (type: ToastType, message: string) => void;
  confirm: (opts: ConfirmOpts) => Promise<boolean>;
};

const FeedbackContext = createContext<Ctx>({ toast: () => {}, confirm: async () => false });

export const useToast = () => {
  const { toast } = useContext(FeedbackContext);
  return {
    success: (m: string) => toast("success", m),
    error: (m: string) => toast("error", m),
    info: (m: string) => toast("info", m),
  };
};
export const useConfirm = () => useContext(FeedbackContext).confirm;

const icons = { success: CheckCircle2, error: XCircle, info: Info };
const tones = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
};

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const nextId = useRef(1);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t.slice(-3), { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), type === "error" ? 6000 : 3500);
  }, []);

  const confirm = useCallback(
    (opts: ConfirmOpts) => new Promise<boolean>((resolve) => setDialog({ ...opts, resolve })),
    [],
  );

  const close = (v: boolean) => {
    dialog?.resolve(v);
    setDialog(null);
  };

  useEffect(() => {
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog]);

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
        {toasts.map((t) => {
          const I = icons[t.type];
          return (
            <div key={t.id} className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${tones[t.type]}`}>
              <I className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="flex-1 leading-snug">{t.message}</p>
              <button onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} aria-label="Dismiss" className="opacity-60 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {dialog && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm" onMouseDown={() => close(false)}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex gap-4">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${dialog.danger ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h2 id="confirm-title" className="font-display text-lg font-bold text-slate-900">
                  {dialog.title}
                </h2>
                {dialog.message && <p className="mt-1 text-sm leading-relaxed text-slate-600">{dialog.message}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="abtn-ghost" onClick={() => close(false)} autoFocus>
                Cancel
              </button>
              <button
                className={dialog.danger ? "abtn bg-red-600 text-white hover:bg-red-700" : "abtn-primary"}
                onClick={() => close(true)}
              >
                {dialog.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}
