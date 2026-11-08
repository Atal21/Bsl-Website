"use client";

import { Boxes, ExternalLink, Factory, Image as ImageIcon, Inbox, LayoutDashboard, Layers, LogOut, Menu, Settings, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/admin-client";
import { FeedbackProvider } from "./feedback";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/industries", label: "Industries", icon: Factory },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/admin/media", label: "Media library", icon: ImageIcon },
  { href: "/admin/settings", label: "Site settings", icon: Settings },
];

export default function AdminShell({ user, newCount, brand, children }: { user: { name: string; email: string }; newCount: number; brand: { name: string; logo: string }; children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  async function logout() {
    await api("/api/admin/auth/logout", { method: "POST", body: {} }).catch(() => {});
    window.location.href = "/admin/login";
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-ink-900 text-slate-300">
      <div className="flex items-center gap-3 px-5 py-5">
        <Image src={brand.logo} alt="" width={40} height={40} className="rounded-full" />
        <div className="leading-tight">
          <p className="font-display text-sm font-bold uppercase tracking-wide text-white">{brand.name} Admin</p>
          <p className="text-[11px] text-brand">Control panel</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {nav.map(({ href, label, icon: I, exact }) => {
          const active = exact ? path === href : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-brand text-ink-900" : "hover:bg-white/10 hover:text-white"}`}
            >
              <I className="h-4 w-4" />
              <span className="flex-1">{label}</span>
              {href === "/admin/enquiries" && newCount > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${active ? "bg-ink-900 text-brand" : "bg-brand text-ink-900"}`}>{newCount}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-white/10 hover:text-white">
          <ExternalLink className="h-4 w-4" /> View website
        </a>
        <div className="mt-2 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
          <button onClick={logout} aria-label="Sign out" title="Sign out" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10 hover:text-white">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <FeedbackProvider>
      <div className="min-h-screen bg-slate-50">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-64 shadow-2xl">{sidebar}</aside>
          </div>
        )}

        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
            <button onClick={() => setOpen((o) => !o)} aria-label="Menu" className="abtn-icon">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="font-display text-sm font-bold uppercase tracking-wide text-slate-900">{brand.name} Admin</span>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </FeedbackProvider>
  );
}
