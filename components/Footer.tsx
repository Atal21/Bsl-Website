import { ArrowUpRight, Clock, Download, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import Link from "next/link";
import { getCategories, getSettings } from "@/lib/data";
import { FALLBACK_LOGO, mailHref, navLinks, telHref } from "@/lib/site";
import Logo from "./Logo";

export default async function Footer() {
  const [site, categories] = await Promise.all([getSettings(), getCategories()]);
  const year = new Date().getFullYear();
  const socials = [
    { label: "Facebook", href: site.social.facebook, Icon: Facebook },
    { label: "Instagram", href: site.social.instagram, Icon: Instagram },
    { label: "LinkedIn", href: site.social.linkedin, Icon: Linkedin },
    { label: "YouTube", href: site.social.youtube, Icon: Youtube },
  ].filter((s) => s.href);
  return (
    <footer className="relative mt-10 overflow-hidden border-t border-white/10 bg-ink-950">
      <div className="hazard" />
      {/* giant watermark logo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-10 h-[28rem] w-[28rem] bg-contain bg-no-repeat opacity-[0.04]"
        style={{ backgroundImage: `url(${site.logo || FALLBACK_LOGO})` }}
      />

      <div className="container-x relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo size={64} dark />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-400">
            {site.footerText}
          </p>
          {site.catalogPdf && (
            <a
              href={site.catalogPdf}
              download
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand/40 px-5 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand hover:text-ink-900"
            >
              <Download className="h-4 w-4" /> Download Catalogue
            </a>
          )}
          {socials.length > 0 && (
            <div className="mt-6 flex gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-slate-300 transition hover:border-brand hover:text-brand"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-white">Company</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {[...navLinks, { href: "/track", label: "Track enquiry" }].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-slate-400 transition hover:text-brand">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-white">Products</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/products?category=${c.slug}`} className="text-slate-400 transition hover:text-brand">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-white">Get in touch</h3>
          <ul className="mt-5 space-y-4 text-sm text-slate-400">
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <a href={telHref(site)} className="transition hover:text-brand">
                {site.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <a href={mailHref(site)} className="break-all transition hover:text-brand">
                {site.email}
              </a>
            </li>
            {site.hours && (
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>{site.hours}</span>
              </li>
            )}
            {site.address && (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>{site.address}</span>
              </li>
            )}
          </ul>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition hover:text-brand"
          >
            Request a quotation <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-slate-500 sm:flex-row">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          {site.tagline && <p className="font-medium tracking-[0.2em] text-slate-400">{site.tagline.toUpperCase()}</p>}
        </div>
      </div>
    </footer>
  );
}
