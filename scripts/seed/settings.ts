// Starter site content. Used ONLY by `npm run seed` (never imported by the website).
// After seeding, every value is edited from Admin → Site settings.
import type { SiteSettings } from "../../lib/types";

export const seedSettings: SiteSettings = {
  name: "BSL Enterprise",
  tagline: "Rise Above Expectations",
  description:
    "BSL Enterprise manufactures hydraulic scissor lifts, goods elevators, car lifts, aerial work platforms and dock equipment for trading, warehousing and logistics.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bslenterprise.com",
  phone: process.env.NEXT_PUBLIC_PHONE ?? "+91 00000 00000",
  email: process.env.NEXT_PUBLIC_EMAIL ?? "info@bslenterprise.com",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "910000000000",
  address: process.env.NEXT_PUBLIC_ADDRESS ?? "",
  hours: "Mon – Sat, 9:00 AM – 7:00 PM",
  catalogPdf: "/BSL-Enterprise-Catalog.pdf",
  logo: "/images/logo-circle.png",
  heroImage: "/images/products/hero-bg.jpg",
  heroCards: [
    { image: "/images/products/fixed-scissor.jpg", label: "Fixed Scissor Lift" },
    { image: "/images/products/mobile-scissor.jpg", label: "Mobile Scissor Lift" },
  ],
  social: { facebook: "", instagram: "", linkedin: "", youtube: "" },
  seo: {
    title: "BSL Enterprise | Industrial Lifting Solutions Engineered for Reliability",
    keywords: [
      "hydraulic scissor lift",
      "goods lift",
      "car lift",
      "aerial working platform",
      "dock leveler",
      "dock ramp",
      "industrial lifting solutions",
    ],
  },
  hero: {
    badge: "Rise Above Expectations",
    accentLines: ["Industrial Lifting", "Solutions"],
    lines: ["Engineered for", "Reliability"],
    description:
      "We deliver reliable industrial lifting and material-handling solutions designed for performance, safety and efficiency — hydraulic lifts, scissor lifts, goods elevators and customised lifting systems.",
    chips: ["Hydraulic Lifts", "Goods Elevators", "Scissor Platforms", "Custom Systems"],
    servesLine: "Serving Trading • Warehousing • Logistics",
    tagTitle: "Engineering precision.",
    tagAccent: "Certified safety.",
  },
  stats: [
    { to: 90, suffix: "+", label: "Standard models", note: "across every product family" },
    { to: 14, suffix: " m", label: "Mobile scissor reach", note: "up to 14,000 mm" },
    { to: 12, suffix: " T", label: "Dock leveler capacity", note: "up to 12,000 kg" },
    { to: 5, suffix: "", label: "Product families", note: "plus custom systems" },
  ],
  home: {
    categories: {
      eyebrow: "What we build",
      title: "A complete range of",
      accent: "lifting equipment",
      description: "From fixed scissor lifts to dock ramps — every product is engineered for performance, safety and long service life.",
    },
    featured: { eyebrow: "Featured products", title: "Built tough.", accent: "Built to last.", description: "" },
    whyUs: {
      eyebrow: "Why BSL Enterprise",
      title: "Dependable solutions for the",
      accent: "modern industry",
      description: "We combine solid engineering with responsive service, so every lift we deliver performs safely from day one.",
      items: [
        { icon: "cog", title: "Engineering precision", text: "Quality engineering and high-precision hydraulic systems that deliver stable, repeatable lifting." },
        { icon: "shield", title: "Certified safety", text: "Limit switches, overload relief valves, emergency stops and manual descent built into our designs." },
        { icon: "gauge", title: "Uncompromising performance", text: "Rugged structures adapted to high-frequency, continuous running — year after year." },
        { icon: "timer", title: "Timely delivery", text: "A commitment to quality and timely service so your operations never wait on equipment." },
        { icon: "wrench", title: "Custom-built systems", text: "Platform size, capacity, height and power supply tailored to your site and workflow." },
        { icon: "handshake", title: "Long-term partnership", text: "Easy installation, low maintenance and dependable support through the life of the machine." },
      ],
    },
    industries: {
      eyebrow: "Industries we serve",
      title: "Serving",
      accent: "Trading • Warehousing • Logistics",
      description: "Lifting and material-handling equipment shaped around the way these industries actually work.",
    },
    purpose: {
      eyebrow: "Our purpose",
      title: "Redefining Industrial Lifting with",
      accent: "Innovation & Reliability",
      description: "",
      lines: ["Engineering precision.", "Certified safety."],
      accentLine: "Uncompromising performance.",
    },
    process: {
      eyebrow: "How we work",
      title: "From enquiry to",
      accent: "operation",
      description: "",
      steps: [
        { title: "Enquiry & consultation", text: "Share your load, height, platform size and site details — we understand the job first." },
        { title: "Design & quotation", text: "We select or engineer the right model and send a clear technical and commercial proposal." },
        { title: "Manufacturing", text: "Fabrication with quality materials, precision hydraulics and safety devices fitted as standard." },
        { title: "Installation & support", text: "Timely delivery, easy installation and dependable after-sales service." },
      ],
    },
  },
  pages: {
    products: {
      eyebrow: "Our products",
      title: "Lifting equipment for",
      accent: "every industrial need",
      description:
        "Browse our range of scissor lifts, car lifts, goods elevators, aerial platforms and dock equipment. Every model can be customised to your load, height and site.",
      meta: "Hydraulic scissor lifts, mobile scissor lifts, car lifts, goods lifts, aerial working platforms, dock levelers and movable dock ramps from BSL Enterprise.",
    },
    industries: {
      eyebrow: "Industries",
      title: "Solutions shaped around",
      accent: "your industry",
      description: "From godowns and wholesale markets to logistics hubs and showrooms, we match the right lifting equipment to the way you work.",
      meta: "Lifting and material-handling solutions for trading, warehousing, logistics, factories, automotive and commercial buildings.",
    },
    about: {
      eyebrow: "About us",
      title: "We help industry",
      accent: "rise above expectations",
      description: "BSL Enterprise delivers reliable industrial lifting and material-handling solutions designed for performance, safety and efficiency.",
      meta: "BSL Enterprise delivers reliable industrial lifting and material-handling solutions designed for performance, safety and efficiency.",
    },
    contact: {
      eyebrow: "Contact",
      title: "Let's lift your",
      accent: "business higher",
      description: "Tell us what you need to lift and we'll recommend the right equipment, with specifications and a quotation.",
      meta: "Request a quotation or technical advice from BSL Enterprise for your industrial lifting requirement.",
    },
  },
  about: {
    story: [
      "Our range includes hydraulic lifts, scissor lifts, goods elevators and customised lifting systems for the trading and logistics sectors — along with car lifts, aerial working platforms and dock equipment.",
      "With a commitment to quality and timely service, BSL Enterprise ensures dependable solutions for the modern industry — equipment you can rely on shift after shift.",
    ],
    mission:
      "To deliver reliable, high-performance lifting and material-handling solutions that enhance safety, efficiency and productivity. We are committed to quality engineering, timely delivery and long-term customer partnerships.",
    vision: "To become a globally trusted leader in industrial lifting solutions, recognised for innovation, service excellence and dependable performance.",
    storyHeading: { eyebrow: "Who we are", title: "Industrial lifting,", accent: "engineered for reliability", description: "" },
    commitments: [
      "Quality engineering on every unit",
      "Timely delivery and dependable service",
      "Safety devices built in as standard",
      "Customised to your site and workflow",
      "Easy installation and low maintenance",
      "Long-term customer partnerships",
    ],
    values: {
      eyebrow: "What drives us",
      title: "Engineering precision. Certified safety.",
      accent: "Uncompromising performance.",
      description: "",
    },
    range: { eyebrow: "Our range", title: "Everything you need to", accent: "lift, load and reach", description: "" },
    customLabel: "Custom Lifting Systems",
  },
  contact: {
    checklistTitle: "What to include in your enquiry",
    checklist: ["Load capacity (kg) and lifting height (mm)", "Platform size and power supply", "Where and how the lift will be used"],
    whatsappMessage: "Hello BSL Enterprise, I would like to enquire about your lifting solutions.",
  },
  cta: {
    title: "Need a lift that fits your exact requirement?",
    text: "Tell us your load, height and site conditions. We'll engineer a safe, reliable solution and send you a quotation.",
  },
  footerText:
    "Reliable industrial lifting and material-handling solutions designed for performance, safety and efficiency — serving trading, warehousing and logistics.",
};
