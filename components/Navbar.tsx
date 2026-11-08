"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks, telHref } from "@/lib/site";
import { useLive } from "@/lib/use-live";
import type { Category } from "@/lib/types";
import Icon from "./Icon";
import Logo from "./Logo";
import { useSite } from "./SiteProvider";

export default function Navbar({ categories: initialCategories }: { categories: Category[] }) {
  const site = useSite();
  const categories = useLive<Category[]>("/api/categories", initialCategories);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMega(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-slate-200 bg-white/85 py-2.5 backdrop-blur-xl"
          : "bg-gradient-to-b from-white/90 to-transparent py-4"
      }`}
    >
      <div className="container-x flex items-center justify-between gap-6">
        <Logo />

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {navLinks.map((l) =>
            l.href === "/products" ? (
              <div key={l.href} className="relative" onMouseEnter={() => setMega(true)} onMouseLeave={() => setMega(false)}>
                <Link
                  href={l.href}
                  className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive(l.href) ? "text-amber-700" : "text-slate-800 hover:text-slate-900"
                  }`}
                >
                  {l.label}
                  <ChevronDown className={`h-4 w-4 transition ${mega ? "rotate-180" : ""}`} />
                </Link>
                <AnimatePresence>
                  {mega && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-1/2 top-full w-[34rem] -translate-x-1/2 pt-3"
                    >
                      <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-card backdrop-blur-xl">
                        <div className="grid grid-cols-2 gap-1">
                          {categories.map((c) => (
                            <Link
                              key={c.slug}
                              href={`/products?category=${c.slug}`}
                              className="group flex items-start gap-3 rounded-xl p-3 transition hover:bg-slate-100"
                            >
                              <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand/10 text-amber-700 transition group-hover:bg-brand group-hover:text-ink-900">
                                <Icon name={c.icon} className="h-5 w-5" />
                              </span>
                              <span>
                                <span className="block text-sm font-semibold text-slate-900">{c.name}</span>
                                <span className="block text-xs leading-snug text-slate-600">{c.blurb}</span>
                              </span>
                            </Link>
                          ))}
                          <Link
                            href="/products"
                            className="col-span-2 mt-1 flex items-center justify-between rounded-xl bg-brand/10 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-brand hover:text-ink-900"
                          >
                            View all products <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive(l.href) ? "text-amber-700" : "text-slate-800 hover:text-slate-900"
                }`}
              >
                {l.label}
                {isActive(l.href) && (
                  <motion.span layoutId="nav-dot" className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-brand" />
                )}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a href={telHref(site)} className="flex items-center gap-2 text-sm font-medium text-slate-800 transition hover:text-amber-700">
            <Phone className="h-4 w-4 text-amber-700" />
            {site.phone}
          </a>
          <Link href="/contact" className="btn-primary !px-5 !py-2.5">
            Get a Quote
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="grid h-11 w-11 place-items-center rounded-full border border-slate-300 bg-slate-100 text-slate-900 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "calc(100vh - 70px)" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-y-auto lg:hidden"
          >
            <nav className="container-x flex flex-col gap-1 py-6" aria-label="Mobile">
              {navLinks.map((l, i) => (
                <motion.div key={l.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link
                    href={l.href}
                    className={`flex items-center justify-between border-b border-slate-200 py-4 font-display text-2xl font-semibold ${
                      isActive(l.href) ? "text-amber-700" : "text-slate-900"
                    }`}
                  >
                    {l.label}
                    <ArrowRight className="h-5 w-5 opacity-50" />
                  </Link>
                </motion.div>
              ))}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/products?category=${c.slug}`}
                    className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-3 text-sm font-medium text-slate-800"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
              <a href={telHref(site)} className="btn-ghost mt-6">
                <Phone className="h-4 w-4 text-amber-700" /> {site.phone}
              </a>
              <Link href="/contact" className="btn-primary">
                Get a Quote
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
