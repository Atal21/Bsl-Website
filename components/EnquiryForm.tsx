"use client";

import { CheckCircle2, Loader2, MailCheck, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { whatsappHref } from "@/lib/site";
import { useSite } from "./SiteProvider";

type Status = "idle" | "loading" | "success" | "error";

export default function EnquiryForm({ defaultProduct = "", productNames = [] }: { defaultProduct?: string; productNames?: string[] }) {
  const site = useSite();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [ref, setRef] = useState("");

  // Email OTP (only when the server has OTP_ENABLED=true)
  const [otpOn, setOtpOn] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<{ stage: "idle" | "sent" | "verified"; code: string; token: string; busy: boolean; msg: string; wait: number }>({
    stage: "idle", code: "", token: "", busy: false, msg: "", wait: 0,
  });

  useEffect(() => {
    fetch("/api/otp/config").then((r) => r.json()).then((j) => setOtpOn(!!j.enabled)).catch(() => {});
  }, []);
  useEffect(() => {
    if (otp.wait <= 0) return;
    const t = setTimeout(() => setOtp((o) => ({ ...o, wait: o.wait - 1 })), 1000);
    return () => clearTimeout(t);
  }, [otp.wait]);

  const resetOtp = () => setOtp({ stage: "idle", code: "", token: "", busy: false, msg: "", wait: 0 });
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function otpCall(path: "request" | "verify", body: object) {
    const res = await fetch(`/api/otp/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(json.error || "Something went wrong."), { retryAfter: json.details?.retryAfter });
    return json;
  }
  async function sendCode() {
    setOtp((o) => ({ ...o, busy: true, msg: "" }));
    try {
      const j = await otpCall("request", { purpose: "file", email });
      setOtp((o) => ({ ...o, stage: "sent", busy: false, code: "", msg: "We emailed you a 6-digit code (valid for 5 minutes).", wait: j.resendIn ?? 30 }));
    } catch (e) {
      const err = e as Error & { retryAfter?: number };
      setOtp((o) => ({ ...o, busy: false, msg: err.message, wait: err.retryAfter ?? o.wait }));
    }
  }
  async function checkCode() {
    setOtp((o) => ({ ...o, busy: true, msg: "" }));
    try {
      const j = await otpCall("verify", { purpose: "file", email, code: otp.code });
      setOtp((o) => ({ ...o, stage: "verified", token: j.token, busy: false, msg: "" }));
    } catch (e) {
      setOtp((o) => ({ ...o, busy: false, msg: (e as Error).message }));
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data: Record<string, unknown> = Object.fromEntries(fd.entries());
    data.email = email.trim();
    data.notifyEmail = fd.get("notifyEmail") === "on";
    data.otpToken = otp.token;
    if (otpOn && otp.stage !== "verified") {
      setError("Please verify your email with the code we send you.");
      setStatus("error");
      return;
    }
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong. Please try again.");
      setSummary(
        `Hello ${site.name}, I am ${data.name}. I am interested in: ${data.product || "your lifting solutions"}. ${data.message || ""}`,
      );
      setRef(json.ref || "");
      setStatus("success");
      form.reset();
      setEmail("");
      resetOtp();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="card flex flex-col items-center p-10 text-center">
        <CheckCircle2 className="h-14 w-14 text-amber-700" />
        <h3 className="font-display-tight mt-5 text-2xl font-bold text-slate-900">Thank you! Enquiry received.</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-600">
          Our team will get back to you shortly with specifications and a quotation. For a faster response, message us on
          WhatsApp.
        </p>
        {ref && (
          <p className="mt-4 rounded-xl bg-slate-50 px-5 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
            Your ticket number: <span className="font-display text-base font-bold tracking-wide text-slate-900">{ref}</span>
            <Link href="/track" className="mt-1 block text-xs font-semibold text-amber-700 hover:underline">
              Track this enquiry →
            </Link>
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={whatsappHref(site, summary)} target="_blank" rel="noopener noreferrer" className="btn-primary">
            <MessageCircle className="h-4 w-4" /> Continue on WhatsApp
          </a>
          <button onClick={() => setStatus("idle")} className="btn-ghost">
            Send another enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 sm:p-8" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name *">
          <input name="name" required autoComplete="name" placeholder="Your name" className="input" />
        </Field>
        <Field label="Phone *">
          <input name="phone" required type="tel" autoComplete="tel" placeholder="+91 ..." className="input" />
        </Field>
        <Field label={otpOn ? "Email *" : "Email"}>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="input"
            value={email}
            required={otpOn}
            readOnly={otp.stage === "verified"}
            onChange={(e) => {
              setEmail(e.target.value);
              if (otp.stage !== "idle") resetOtp();
            }}
          />
        </Field>
        {otpOn && (
          <div className="sm:col-span-2 -mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {otp.stage === "verified" ? (
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <MailCheck className="h-4 w-4" /> Email verified
              </p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  {otp.stage === "sent" && (
                    <input
                      inputMode="numeric"
                      maxLength={6}
                      value={otp.code}
                      onChange={(e) => setOtp((o) => ({ ...o, code: e.target.value.replace(/\D/g, "") }))}
                      placeholder="6-digit code"
                      aria-label="Verification code"
                      className="input !w-40 tracking-[0.3em]"
                    />
                  )}
                  {otp.stage === "sent" && (
                    <button type="button" className="btn-primary !py-2.5" disabled={otp.busy || otp.code.length !== 6} onClick={checkCode}>
                      Verify
                    </button>
                  )}
                  <button type="button" className="btn-ghost !py-2.5" disabled={otp.busy || !emailOk || otp.wait > 0} onClick={sendCode}>
                    {otp.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
                    {otp.stage === "sent" ? (otp.wait > 0 ? `Resend in ${otp.wait}s` : "Resend code") : "Send verification code"}
                  </button>
                </div>
                {otp.msg && <p className="mt-2 text-xs text-slate-600">{otp.msg}</p>}
              </>
            )}
          </div>
        )}
        <Field label="Company">
          <input name="company" autoComplete="organization" placeholder="Company name" className="input" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Product of interest">
            <select name="product" defaultValue={defaultProduct} className="input">
              <option value="">Select a product (optional)</option>
              {productNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
              <option value="Custom lifting system">Custom lifting system</option>
            </select>
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Your requirement *">
            <textarea
              name="message"
              required
              rows={5}
              placeholder="Load capacity, lifting height, platform size, power supply, location…"
              className="input resize-none"
            />
          </Field>
        </div>
        <label className="flex items-start gap-3 text-sm text-slate-600 sm:col-span-2">
          <input type="checkbox" name="notifyEmail" defaultChecked className="mt-0.5 h-4 w-4 accent-amber-500" />
          <span>Email me my ticket number and status updates on this enquiry (details of your requirement are never sent by email).</span>
        </label>
      </div>

      {/* honeypot field – bots fill it, humans never see it */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {status === "error" && (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" disabled={status === "loading"} className="btn-primary mt-6 w-full disabled:opacity-60 sm:w-auto">
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> Send Enquiry
          </>
        )}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">{label}</span>
      {children}
    </label>
  );
}
