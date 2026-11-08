import { Download, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { getSettings } from "@/lib/data";
import { FALLBACK_LOGO, telHref, whatsappHref } from "@/lib/site";
import Reveal from "./Reveal";

export default async function CTASection({ title, text }: { title?: string; text?: string }) {
  const site = await getSettings();
  title ??= site.cta.title;
  text ??= site.cta.text;
  if (!title && !text) return null;
  return (
    <section className="section pt-0 sm:pt-0">
      <div className="container-x">
        <Reveal>
          <div className="on-dark noise relative overflow-hidden rounded-3xl border border-brand/30 bg-gradient-to-br from-ink-700 via-ink-800 to-ink-900 p-8 sm:p-14">
            <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/25 blur-[90px]" />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 right-6 hidden h-80 w-80 bg-contain bg-no-repeat opacity-[0.08] md:block"
              style={{ backgroundImage: `url(${site.logo || FALLBACK_LOGO})` }}
            />
            <div className="hazard absolute inset-x-0 top-0" />
            <div className="relative max-w-2xl">
              {site.tagline && <span className="eyebrow">{site.tagline}</span>}
              <h2 className="font-display-tight mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                {title}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">{text}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact" className="btn-primary">
                  Get a Free Quote
                </Link>
                <a href={whatsappHref(site, site.contact.whatsappMessage)} target="_blank" rel="noopener noreferrer" className="btn-ghost-dark">
                  <MessageCircle className="h-4 w-4 text-[#25D366]" /> WhatsApp
                </a>
                <a href={telHref(site)} className="btn-ghost-dark">
                  <Phone className="h-4 w-4 text-brand" /> Call Us
                </a>
                {site.catalogPdf && (
                  <a href={site.catalogPdf} download className="btn-ghost-dark">
                    <Download className="h-4 w-4 text-brand" /> Catalogue
                  </a>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
