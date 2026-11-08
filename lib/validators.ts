import { z } from "zod";
import { iconNames } from "./icon-names";

const str = (max = 200) => z.string().trim().max(max);
const list = (max = 300, n = 40) => z.array(str(max)).max(n).default([]);
const icon = z.enum(iconNames);

const cell = z.union([z.string().max(200), z.number()]);
export const specTableSchema = z.object({
  title: str(160),
  columns: z.array(str(80)).min(1).max(20),
  groups: z
    .array(z.object({ label: str(80).optional(), rows: z.array(z.array(cell).max(20)).max(300) }))
    .min(1)
    .max(12),
  note: str(500).optional(),
});

export const categorySchema = z.object({
  name: str(120).min(1, "Name is required"),
  slug: str(120).default(""),
  blurb: str(400).default(""),
  image: str(500).default(""),
  icon: icon.default("layers"),
  order: z.number().int().min(0).max(100000).default(0),
});

export const productSchema = z.object({
  name: str(160).min(1, "Name is required"),
  slug: str(120).default(""),
  category: str(120).min(1, "Choose a category"),
  tagline: str(300).default(""),
  description: list(3000, 12),
  image: str(500).default(""),
  gallery: z.array(str(500)).max(20).default([]),
  fit: z.enum(["auto", "contain", "cover"]).default("auto"),
  highlights: z
    .array(z.object({ label: str(60), value: str(120) }))
    .max(12)
    .default([]),
  features: list(),
  advantages: list(),
  applications: list(),
  specs: specTableSchema.nullable().default(null),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.number().int().min(0).max(100000).default(0),
});

export const industrySchema = z.object({
  name: str(120).min(1, "Name is required"),
  slug: str(120).default(""),
  icon: icon.default("package"),
  blurb: str(600).default(""),
  needs: list(300, 20),
  products: z.array(str(120)).max(30).default([]),
  published: z.boolean().default(true),
  order: z.number().int().min(0).max(100000).default(0),
});

export const enquiryPatchSchema = z.object({
  status: z.enum(["new", "contacted", "quoted", "closed"]).optional(),
  notify: z.boolean().optional(), // admin "Notify customer" tick (default on)
  notes: str(3000).optional(),
});

export const publicEnquirySchema = z.object({
  name: str(120).min(1, "Please enter your name"),
  phone: str(30).min(1, "Please enter your phone number"),
  email: str(160).default(""),
  company: str(160).default(""),
  product: str(200).default(""),
  message: str(3000).min(1, "Please describe your requirement"),
  notifyEmail: z.boolean().default(false), // customer chose to receive email updates
  otpToken: str(100).default(""), // from /api/otp/verify when OTP_ENABLED
  website: str(200).default(""), // honeypot
});

const emailField = z.string().trim().toLowerCase().email("Enter a valid email address").max(160);
export const otpRequestSchema = z.object({ purpose: z.enum(["file", "track"]), email: emailField });
export const otpVerifySchema = z.object({ purpose: z.enum(["file", "track"]), email: emailField, code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code") });
export const trackLookupSchema = z.object({ ref: str(40).min(1), last4: z.string().trim().regex(/^\d{4}$/, "Enter the last 4 digits of your phone number") });

const heading = z.object({
  eyebrow: str(100).default(""),
  title: str(200).default(""),
  accent: str(200).default(""),
  description: str(600).default(""),
});
const pageCopy = heading.extend({ meta: str(400).default("") });
const url = str(500).default("");

export const settingsSchema = z.object({
  name: str(120).min(1, "Company name is required"),
  tagline: str(200).default(""),
  description: str(600).default(""),
  url: str(300).default(""),
  phone: str(40).min(1, "Phone is required"),
  email: str(160).min(1, "Email is required"),
  whatsapp: str(20).default(""),
  address: str(500).default(""),
  hours: str(200).default(""),
  catalogPdf: url,
  logo: url,
  heroImage: url,
  heroCards: z.array(z.object({ image: url, label: str(80).default("") })).max(2).default([]),
  social: z.object({ facebook: str(300).default(""), instagram: str(300).default(""), linkedin: str(300).default(""), youtube: str(300).default("") }),
  seo: z.object({ title: str(160).default(""), keywords: z.array(str(60)).max(30).default([]) }),
  hero: z.object({
    badge: str(100).default(""),
    accentLines: z.array(str(80)).max(4).default([]),
    lines: z.array(str(80)).max(4).default([]),
    description: str(600).default(""),
    chips: z.array(str(60)).max(8).default([]),
    servesLine: str(200).default(""),
    tagTitle: str(80).default(""),
    tagAccent: str(80).default(""),
  }),
  stats: z
    .array(z.object({ to: z.number().min(0).max(1_000_000), suffix: str(10).default(""), label: str(80), note: str(120).default("") }))
    .max(8),
  home: z.object({
    categories: heading,
    featured: heading,
    whyUs: heading.extend({ items: z.array(z.object({ icon, title: str(80), text: str(400).default("") })).max(12).default([]) }),
    industries: heading,
    purpose: heading.extend({ lines: z.array(str(100)).max(4).default([]), accentLine: str(100).default("") }),
    process: heading.extend({ steps: z.array(z.object({ title: str(80), text: str(400).default("") })).max(8).default([]) }),
  }),
  pages: z.object({ products: pageCopy, industries: pageCopy, about: pageCopy, contact: pageCopy }),
  about: z.object({
    story: z.array(str(2000)).max(8).default([]),
    mission: str(1500).default(""),
    vision: str(1500).default(""),
    storyHeading: heading,
    commitments: z.array(str(200)).max(12).default([]),
    values: heading,
    range: heading,
    customLabel: str(80).default(""),
  }),
  contact: z.object({ checklistTitle: str(120).default(""), checklist: z.array(str(200)).max(10).default([]), whatsappMessage: str(300).default("") }),
  cta: z.object({ title: str(200).default(""), text: str(500).default("") }),
  footerText: str(500).default(""),
});

export const passwordChangeSchema = z.object({
  current: z.string().min(1),
  next: z.string().min(8, "New password must be at least 8 characters").max(100),
});

export const adminCreateSchema = z.object({
  name: str(80).min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(160),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1),
  password: z.string().min(1),
});
