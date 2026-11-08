"use client";

import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";

type Ticket = { ref: string; status: "new" | "contacted" | "quoted" | "closed"; createdAt: string };
const label = { new: "Received", contacted: "Our team has contacted you", quoted: "Quotation sent", closed: "Closed" } as const;
const tone = { new: "bg-amber-50 text-amber-800", contacted: "bg-sky-50 text-sky-700", quoted: "bg-emerald-50 text-emerald-700", closed: "bg-slate-100 text-slate-600" } as const;

async function post(path: string, body: object) {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(json.error || "Something went wrong."), { retryAfter: json.details?.retryAfter as number | undefined });
  return json;
}

export default function TrackForm({ otp }: { otp: boolean }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [ref, setRef] = useState("");
  const [last4, setLast4] = useState("");
  const [stage, setStage] = useState<"form" | "code">("form");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [wait, setWait] = useState(0);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await fn();
    } catch (e) {
      const error = e as Error & { retryAfter?: number };
      setErr(error.message);
      if (error.retryAfter) setWait(error.retryAfter);
    } finally {
      setBusy(false);
    }
  }

  const sendCode = () =>
    run(async () => {
      const j = await post("/api/otp/request", { purpose: "track", email });
      setStage("code");
      setWait(j.resendIn ?? 30);
      // identical wording whether or not this email has a ticket
      setMsg("If this email has an enquiry with us, a 6-digit code is on its way (valid for 5 minutes).");
    });

  const verify = () =>
    run(async () => {
      const j = await post("/api/otp/verify", { purpose: "track", email, code });
      setTickets(j.tickets);
    });

  const lookup = () =>
    run(async () => {
      const j = await post("/api/track/lookup", { ref, last4 });
      setTickets(j.tickets);
    });

  if (tickets) {
    return (
      <div className="card p-6">
        {tickets.length === 0 ? (
          <p className="text-slate-600">No enquiries found for this email.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {tickets.map((t) => (
              <li key={t.ref} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-display font-bold tracking-wide text-slate-900">{t.ref}</p>
                  <p className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[t.status]}`}>{label[t.status]}</span>
              </li>
            ))}
          </ul>
        )}
        <button className="btn-ghost mt-5" onClick={() => { setTickets(null); setStage("form"); setCode(""); }}>
          Check another
        </button>
      </div>
    );
  }

  return (
    <form
      className="card space-y-5 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!otp) lookup();
        else if (stage === "form") sendCode();
        else verify();
      }}
    >
      {otp ? (
        <>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">Email</span>
            <input className="input" type="email" required value={email} readOnly={stage === "code"} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </label>
          {stage === "code" && (
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">Verification code</span>
              <input className="input tracking-[0.3em]" inputMode="numeric" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="6-digit code" autoFocus />
            </label>
          )}
        </>
      ) : (
        <>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">Ticket number</span>
            <input className="input uppercase" required value={ref} onChange={(e) => setRef(e.target.value)} placeholder="BSL-2610-ABC12" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">Last 4 digits of phone</span>
            <input className="input" inputMode="numeric" maxLength={4} required value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))} placeholder="1234" />
          </label>
        </>
      )}

      {msg && <p className="text-sm text-slate-600">{msg}</p>}
      {err && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}

      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" disabled={busy || (otp && stage === "form" && wait > 0)}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {otp ? (stage === "form" ? "Send code" : "Verify & track") : "Track"}
        </button>
        {otp && stage === "code" && (
          <button type="button" className="btn-ghost" disabled={busy || wait > 0} onClick={sendCode}>
            {wait > 0 ? `Resend in ${wait}s` : "Resend code"}
          </button>
        )}
      </div>
    </form>
  );
}
