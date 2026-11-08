import type { IconName } from "./icon-names";
import type { SpecTableData } from "./specs";

export type { IconName, SpecTableData };

export type Fit = "auto" | "contain" | "cover";

export type Category = {
  _id: string;
  slug: string;
  name: string;
  blurb: string;
  image: string;
  icon: IconName;
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Product = {
  _id: string;
  slug: string;
  name: string;
  category: string; // category slug
  tagline: string;
  description: string[];
  image: string;
  gallery: string[];
  fit: Fit;
  highlights: { label: string; value: string }[];
  features: string[];
  advantages: string[];
  applications: string[];
  specs: SpecTableData | null;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

/** Light version of a product for listings (no spec tables / long text), so list pages stay small. */
export type ProductSummary = Pick<
  Product,
  "_id" | "slug" | "name" | "category" | "tagline" | "image" | "fit" | "highlights" | "applications" | "featured" | "order"
>;

export type Industry = {
  _id: string;
  slug: string;
  name: string;
  icon: IconName;
  blurb: string;
  needs: string[];
  products: string[]; // product slugs
  published: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

export type EnquiryStatus = "new" | "contacted" | "quoted" | "closed";
export const enquiryStatuses: EnquiryStatus[] = ["new", "contacted", "quoted", "closed"];

export type Enquiry = {
  _id: string;
  ref: string; // customer-facing ticket number, e.g. BSL-2610-K7Q2M
  notifyEmail: boolean; // customer opted in to email updates
  emailVerified: boolean; // email confirmed with an OTP when the enquiry was filed
  name: string;
  phone: string;
  email: string;
  company: string;
  product: string;
  message: string;
  status: EnquiryStatus;
  notes: string;
  createdAt: string;
  updatedAt?: string;
};

export type NotificationLog = {
  _id: string;
  enquiryId: string;
  ref: string;
  channel: "email" | "sms" | "whatsapp";
  kind: "created" | "status";
  to: string; // masked, e.g. r***@gmail.com
  status: "sent" | "failed" | "skipped";
  error?: string;
  createdAt: string;
};

export type OtpPurpose = "file" | "track";
export type OtpRecord = {
  _id: string;
  purpose: OtpPurpose;
  key: string; // lower-cased email
  codeHash: string;
  expiresAt: string;
  attempts: number;
  sent: boolean; // false when no ticket exists for the email (tracking) - kept so limits behave identically
  verifiedAt?: string;
  consumedAt?: string;
  ip: string;
  createdAt: string;
};

export type MediaItem = {
  _id: string;
  filename: string;
  mime: string;
  size: number;
  width: number;
  height: number;
  alt: string;
  url: string;
  provider: "db" | "cloudinary";
  publicId?: string;
  createdAt: string;
};

export type Admin = {
  _id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

/** A section heading: `title` followed by the highlighted `accent` words. */
export type Heading = { eyebrow: string; title: string; accent: string; description: string };
/** Inner-page banner (plus the SEO meta description of that page). */
export type PageCopy = Heading & { meta: string };

export type SiteSettings = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  phone: string;
  email: string;
  whatsapp: string; // digits only, international format
  address: string;
  hours: string;
  catalogPdf: string;
  logo: string; // circular logo (header, footer, watermark, emails, social card)
  heroImage: string; // faded background photo of the home hero
  heroCards: { image: string; label: string }[]; // floating product cards in the hero (max 2)
  social: { facebook: string; instagram: string; linkedin: string; youtube: string };
  seo: { title: string; keywords: string[] };
  hero: {
    badge: string;
    accentLines: string[];
    lines: string[];
    description: string;
    chips: string[];
    servesLine: string;
    tagTitle: string; // small floating badge: "Engineering precision."
    tagAccent: string; //                        "Certified safety."
  };
  stats: { to: number; suffix: string; label: string; note: string }[];
  home: {
    categories: Heading;
    featured: Heading;
    whyUs: Heading & { items: { icon: IconName; title: string; text: string }[] };
    industries: Heading;
    purpose: Heading & { lines: string[]; accentLine: string };
    process: Heading & { steps: { title: string; text: string }[] };
  };
  pages: { products: PageCopy; industries: PageCopy; about: PageCopy; contact: PageCopy };
  about: {
    story: string[];
    mission: string;
    vision: string;
    storyHeading: Heading;
    commitments: string[];
    values: Heading;
    range: Heading;
    customLabel: string;
  };
  contact: { checklistTitle: string; checklist: string[]; whatsappMessage: string };
  cta: { title: string; text: string };
  footerText: string;
};

export type SettingsDoc = SiteSettings & { _id: string };
