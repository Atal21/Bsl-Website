import FloatingActions from "@/components/FloatingActions";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { SiteProvider } from "@/components/SiteProvider";
import { getCategories, getSettings } from "@/lib/data";
import { FALLBACK_LOGO, siteUrl } from "@/lib/site";

// Content comes from the database, so render per request (data itself is cached for a minute and
// refreshed instantly whenever the admin panel saves).
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [site, categories] = await Promise.all([getSettings(), getCategories()]);
  const base = siteUrl(site);
  const logo = site.logo || FALLBACK_LOGO;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    slogan: site.tagline || undefined,
    url: base,
    logo: /^https?:\/\//.test(logo) ? logo : `${base}${logo}`,
    description: site.description || undefined,
    telephone: site.phone || undefined,
    email: site.email || undefined,
  };
  return (
    <SiteProvider value={site}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-ink-900"
      >
        Skip to content
      </a>
      <Navbar categories={categories} />
      <main id="main">{children}</main>
      <Footer />
      <FloatingActions />
    </SiteProvider>
  );
}
