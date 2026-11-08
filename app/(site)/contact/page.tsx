import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Accent from "@/components/Accent";
import EnquiryForm from "@/components/EnquiryForm";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { getProducts, getSettings } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { mailHref, telHref, whatsappHref } from "@/lib/site";

export const generateMetadata = () => pageMetadata((p) => p.contact, "Contact Us");

export default async function ContactPage({ searchParams }: { searchParams: { product?: string } }) {
  const [site, products] = await Promise.all([getSettings(), getProducts()]);
  const pg = site.pages.contact;
  const cards = [
    ...(site.phone ? [{ icon: Phone, label: "Call us", value: site.phone, href: telHref(site) as string | undefined, external: false }] : []),
    ...(site.whatsapp ? [{ icon: MessageCircle, label: "WhatsApp", value: "Chat instantly", href: whatsappHref(site, site.contact.whatsappMessage) as string | undefined, external: true }] : []),
    ...(site.email ? [{ icon: Mail, label: "Email", value: site.email, href: mailHref(site) as string | undefined, external: false }] : []),
    ...(site.hours ? [{ icon: Clock, label: "Working hours", value: site.hours, href: undefined as string | undefined, external: false }] : []),
    ...(site.address ? [{ icon: MapPin, label: "Visit us", value: site.address, href: undefined as string | undefined, external: false }] : []),
  ];

  return (
    <>
      <PageHero eyebrow={pg.eyebrow} title={<Accent title={pg.title} accent={pg.accent} />} description={pg.description} crumbs={[{ label: "Contact" }]} />

      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            {cards.map((c, i) => {
              const Body = (
                <div className="card group flex items-center gap-4 p-5 transition hover:border-brand/50">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand/10 text-amber-700 transition group-hover:bg-brand group-hover:text-ink-900">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{c.label}</span>
                    <span className="block break-words font-medium text-slate-900">{c.value}</span>
                  </span>
                </div>
              );
              return (
                <Reveal key={c.label} delay={i * 0.07}>
                  {c.href ? (
                    <a href={c.href} {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                      {Body}
                    </a>
                  ) : (
                    Body
                  )}
                </Reveal>
              );
            })}

            {site.contact.checklist.length > 0 && (
              <Reveal delay={0.3}>
                <div className="rounded-2xl border border-brand/30 bg-brand/10 p-6">
                  {site.contact.checklistTitle && <p className="font-display text-lg font-bold text-slate-900">{site.contact.checklistTitle}</p>}
                  <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                    {site.contact.checklist.map((c) => (
                      <li key={c}>• {c}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
          </div>

          <Reveal delay={0.1}>
            <EnquiryForm defaultProduct={searchParams.product ?? ""} productNames={products.map((p) => p.name)} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
