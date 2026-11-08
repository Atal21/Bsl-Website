import type { Heading, PageCopy, SiteSettings } from "./types";

// ---------------------------------------------------------------------------------------------
// The website contains NO content of its own. Everything shown on it (company details, hero,
// section headings, page banners, about text, products ...) is stored in MongoDB and edited from
// the admin panel (Admin → Site settings / Products / Categories / Industries).
//
// `emptySettings` is only the *shape* of the settings document with blank values, so a field that
// has not been filled in yet renders nothing instead of crashing. To load starter content once,
// run `npm run seed` (see scripts/seed).
// ---------------------------------------------------------------------------------------------

/** Brand asset used until a logo is uploaded in Admin → Site settings → Branding. */
export const FALLBACK_LOGO = "/images/logo-circle.png";

const heading = (): Heading => ({ eyebrow: "", title: "", accent: "", description: "" });
const page = (): PageCopy => ({ ...heading(), meta: "" });

export const emptySettings: SiteSettings = {
  name: "",
  tagline: "",
  description: "",
  url: "",
  phone: "",
  email: "",
  whatsapp: "",
  address: "",
  hours: "",
  catalogPdf: "",
  logo: "",
  heroImage: "",
  heroCards: [],
  social: { facebook: "", instagram: "", linkedin: "", youtube: "" },
  seo: { title: "", keywords: [] },
  hero: { badge: "", accentLines: [], lines: [], description: "", chips: [], servesLine: "", tagTitle: "", tagAccent: "" },
  stats: [],
  home: {
    categories: heading(),
    featured: heading(),
    whyUs: { ...heading(), items: [] },
    industries: heading(),
    purpose: { ...heading(), lines: [], accentLine: "" },
    process: { ...heading(), steps: [] },
  },
  pages: { products: page(), industries: page(), about: page(), contact: page() },
  about: { story: [], mission: "", vision: "", storyHeading: heading(), commitments: [], values: heading(), range: heading(), customLabel: "" },
  contact: { checklistTitle: "", checklist: [], whatsappMessage: "" },
  cta: { title: "", text: "" },
  footerText: "",
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/industries", label: "Industries" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

type Contact = Pick<SiteSettings, "phone" | "email" | "whatsapp">;

export const telHref = (s: Contact) => `tel:${s.phone.replace(/[^+\d]/g, "")}`;
export const mailHref = (s: Contact) => `mailto:${s.email}`;
export const whatsappHref = (s: Contact, text = "") => {
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${s.whatsapp.replace(/\D/g, "")}${q}`;
};

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/** Lay the saved document over the empty shape (deeply) so a missing field is never `undefined`. */
function deepMerge<T>(base: T, saved: unknown): T {
  if (!isObj(base) || !isObj(saved)) return (saved === undefined || saved === null ? base : saved) as T;
  const out: Record<string, unknown> = { ...base };
  for (const k of Object.keys(saved)) out[k] = k in base ? deepMerge((base as Record<string, unknown>)[k], saved[k]) : saved[k];
  return out as T;
}

export function mergeSettings(saved?: Partial<SiteSettings> | null): SiteSettings {
  return deepMerge(emptySettings, saved ?? {});
}

/** Public base URL of the site: the saved URL, else NEXT_PUBLIC_SITE_URL, else localhost. */
export function siteUrl(s?: Pick<SiteSettings, "url">) {
  return (s?.url || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
