"use client";

import { Loader2, Lock } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { api, errMsg } from "@/lib/admin-client";

export default function LoginForm({ brand }: { brand: { name: string; logo: string } }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/auth/login", { body: { email, password } });
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.href = next && next.startsWith("/admin") ? next : "/admin";
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src={brand.logo} alt={brand.name} width={64} height={64} className="rounded-full shadow-md" priority />
          <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">Admin sign in</h1>
          <p className="mt-1 text-sm text-slate-500">{brand.name ? `${brand.name} · ` : ""}Manage products, enquiries and site content.</p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Email</span>
            <input className="input" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Password</span>
            <input className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <button className="abtn-primary w-full !py-2.5" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
