import type { Metadata, Viewport } from "next";
import { getSettings } from "@/lib/data";
import { FALLBACK_LOGO, siteUrl } from "@/lib/site";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSettings().catch(() => null);
  const base = siteUrl(site ?? undefined);
  if (!site || !site.name) return { metadataBase: new URL(base), robots: { index: false, follow: false } };
  const title = site.seo.title || (site.tagline ? `${site.name} | ${site.tagline}` : site.name);
  return {
    metadataBase: new URL(base),
    title: { default: title, template: `%s | ${site.name}` },
    description: site.description || undefined,
    keywords: [...site.seo.keywords, site.name].filter(Boolean),
    applicationName: site.name,
    openGraph: {
      type: "website",
      siteName: site.name,
      title: site.tagline ? `${site.name} – ${site.tagline}` : site.name,
      description: site.description || undefined,
      images: [{ url: site.logo || FALLBACK_LOGO, width: 512, height: 512, alt: `${site.name} logo` }],
    },
    twitter: { card: "summary", title: site.name, description: site.description || undefined },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
