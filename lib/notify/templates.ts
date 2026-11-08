import type { Enquiry, EnquiryStatus, SiteSettings } from "@/lib/types";
import { FALLBACK_LOGO, siteUrl } from "@/lib/site";

/**
 * Modern, responsive HTML emails (table layout + inline CSS so Gmail, Outlook, Apple Mail and phones
 * all render them the same). Every function returns { subject, text, html } - `text` is the plain-text
 * fallback for clients that block HTML.
 *
 * Privacy: customer emails carry ONLY the ticket number and status. The business alert carries the
 * full enquiry and goes only to the company's own inbox.
 */

export type Mail = { subject: string; text: string; html: string };
type Site = Pick<SiteSettings, "name" | "tagline" | "url" | "phone" | "email" | "whatsapp" | "address" | "hours" | "logo">;

const C = {
  ink: "#0b0d12",
  inkSoft: "#1b1f2a",
  brand: "#ffd60a",
  brandDark: "#b45309",
  text: "#0f172a",
  muted: "#64748b",
  line: "#e2e8f0",
  bg: "#f1f5f9",
  card: "#ffffff",
  soft: "#f8fafc",
  ok: "#15803d",
};
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

const base = (site: Site) => siteUrl(site);
const digits = (s: string) => s.replace(/\D/g, "");

/* ------------------------------------------------------------------ building blocks */

function button(label: string, href: string, kind: "primary" | "ghost" = "primary") {
  const primary = kind === "primary";
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;margin:0 8px 8px 0"><tr>
<td align="center" bgcolor="${primary ? C.brand : C.card}" style="border-radius:10px;${primary ? "" : `border:1px solid ${C.line};`}">
<a href="${esc(href)}" target="_blank" style="display:inline-block;padding:13px 24px;font:700 14px/1 ${FONT};color:${C.ink};text-decoration:none;border-radius:10px">${esc(label)}</a>
</td></tr></table>`;
}

function shell(site: Site, o: { preheader: string; eyebrow: string; title: string; body: string; footerNote?: string }) {
  const logoPath = site.logo || FALLBACK_LOGO;
  const logo = /^https?:\/\//.test(logoPath) ? logoPath : `${base(site)}${logoPath}`;
  const contactBits = [
    site.phone && `<a href="tel:${esc(site.phone.replace(/[^+\d]/g, ""))}" style="color:${C.muted};text-decoration:none">${esc(site.phone)}</a>`,
    site.email && `<a href="mailto:${esc(site.email)}" style="color:${C.muted};text-decoration:none">${esc(site.email)}</a>`,
  ].filter(Boolean);

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>${esc(o.title)}</title>
<style>
  @media only screen and (max-width:620px){
    .wrap{width:100%!important}
    .px{padding-left:22px!important;padding-right:22px!important}
    .h1{font-size:24px!important}
    .stack{display:block!important;width:100%!important}
    .code{font-size:32px!important;letter-spacing:8px!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.bg};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all">${esc(o.preheader)}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.bg}" style="background:${C.bg}">
<tr><td align="center" style="padding:32px 12px">

<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px">
  <!-- header -->
  <tr><td style="background:${C.ink};border-radius:18px 18px 0 0;padding:0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td class="px" style="padding:22px 36px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="vertical-align:middle"><img src="${esc(logo)}" width="40" height="40" alt="" style="display:block;border:0;border-radius:50%;background:${C.inkSoft}"></td>
          <td style="vertical-align:middle;padding-left:12px;font:800 17px/1.2 ${FONT};color:#ffffff;letter-spacing:.01em">${esc(site.name)}
            <div style="font:600 11px/1.4 ${FONT};color:${C.brand};letter-spacing:.14em;text-transform:uppercase;padding-top:2px">${esc(site.tagline)}</div></td>
        </tr></table>
      </td>
    </tr></table>
    <div style="height:4px;background:${C.brand};background-image:repeating-linear-gradient(135deg,${C.brand} 0,${C.brand} 12px,${C.ink} 12px,${C.ink} 24px);line-height:4px;font-size:0">&nbsp;</div>
  </td></tr>

  <!-- card -->
  <tr><td class="px" style="background:${C.card};padding:36px 36px 12px;border-left:1px solid ${C.line};border-right:1px solid ${C.line}">
    <div style="font:700 11px/1 ${FONT};letter-spacing:.16em;text-transform:uppercase;color:${C.brandDark}">${esc(o.eyebrow)}</div>
    <h1 class="h1" style="margin:12px 0 0;font:800 28px/1.2 ${FONT};color:${C.text};letter-spacing:-.01em">${esc(o.title)}</h1>
  </td></tr>
  <tr><td class="px" style="background:${C.card};padding:8px 36px 36px;border-left:1px solid ${C.line};border-right:1px solid ${C.line};font:400 15px/1.65 ${FONT};color:#334155">
    ${o.body}
  </td></tr>

  <!-- footer -->
  <tr><td class="px" style="background:${C.soft};border:1px solid ${C.line};border-top:0;border-radius:0 0 18px 18px;padding:24px 36px;font:400 12px/1.7 ${FONT};color:${C.muted}">
    <strong style="color:${C.text}">${esc(site.name)}</strong>${site.address ? ` &middot; ${esc(site.address)}` : ""}<br>
    ${contactBits.join(" &nbsp;&middot;&nbsp; ")}${site.hours ? `<br>${esc(site.hours)}` : ""}
    ${o.footerNote ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid ${C.line}">${o.footerNote}</div>` : ""}
  </td></tr>
</table>

<div style="font:400 11px/1.6 ${FONT};color:#94a3b8;padding:18px 0 0">&copy; ${new Date().getFullYear()} ${esc(site.name)}. All rights reserved.</div>
</td></tr></table>
</body></html>`;
}

function kv(label: string, value: string, big = false) {
  return `<tr><td style="padding:0 0 14px">
<div style="font:700 11px/1 ${FONT};letter-spacing:.12em;text-transform:uppercase;color:${C.muted}">${esc(label)}</div>
<div style="font:${big ? "800 26px" : "600 16px"}/1.3 ${FONT};color:${C.text};padding-top:6px;${big ? "letter-spacing:.04em" : ""}">${value}</div></td></tr>`;
}

/* ------------------------------------------------------------------ status tracker */

const STEPS: { key: EnquiryStatus; label: string }[] = [
  { key: "new", label: "Received" },
  { key: "contacted", label: "In touch" },
  { key: "quoted", label: "Quotation" },
  { key: "closed", label: "Closed" },
];

const COPY: Record<EnquiryStatus, { title: string; lead: string; pre: string }> = {
  new: {
    title: "We've received your enquiry",
    lead: "Thank you for reaching out. Our engineers will review your requirement and get back to you shortly with specifications and a quotation.",
    pre: "Your enquiry is in. Keep your ticket number handy.",
  },
  contacted: {
    title: "Our team has contacted you",
    lead: "One of our specialists has reached out about your enquiry. If you missed us, just reply to this email or give us a call and we'll pick up from there.",
    pre: "A specialist has reached out about your enquiry.",
  },
  quoted: {
    title: "Your quotation has been sent",
    lead: "We've prepared a quotation for your requirement. Please check the details shared by our team, and let us know if you'd like to change load, height or platform size.",
    pre: "Your quotation is ready.",
  },
  closed: {
    title: "This enquiry is now closed",
    lead: "We've marked this enquiry as closed. If you still need something, you can start a new enquiry any time and we'll be happy to help.",
    pre: "Your enquiry has been closed.",
  },
};

function tracker(current: EnquiryStatus) {
  const idx = STEPS.findIndex((s) => s.key === current);
  const cells = STEPS.map((s, i) => {
    const done = i < idx;
    const now = i === idx;
    const bg = done ? C.ok : now ? C.brand : C.line;
    const fg = done ? "#ffffff" : now ? C.ink : C.muted;
    const bar = (side: "l" | "r") => {
      const lit = side === "l" ? i <= idx && i > 0 : i < idx;
      const hide = (side === "l" && i === 0) || (side === "r" && i === STEPS.length - 1);
      return `<td width="50%" style="height:3px;line-height:3px;font-size:0;${hide ? "" : `background:${lit ? C.ok : C.line}`}">&nbsp;</td>`;
    };
    return `<td align="center" width="25%" style="vertical-align:top">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${bar("l")}
<td style="width:30px"><div style="width:30px;height:30px;line-height:30px;border-radius:15px;background:${bg};color:${fg};font:800 13px/30px ${FONT};text-align:center;${now ? `box-shadow:0 0 0 4px rgba(255,214,10,.35)` : ""}">${done ? "&#10003;" : i + 1}</div></td>
${bar("r")}</tr></table>
<div style="font:${now ? "700" : "500"} 12px/1.4 ${FONT};color:${now ? C.text : C.muted};padding-top:8px">${s.label}</div></td>`;
  }).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 6px"><tr>${cells}</tr></table>`;
}

/* ------------------------------------------------------------------ templates */

/** Customer: enquiry received / status changed. Ticket number + status only. */
export function enquiryEmail(site: Site, enquiry: Pick<Enquiry, "ref" | "status" | "name">, kind: "created" | "status"): Mail {
  const copy = COPY[enquiry.status];
  const label = STEPS.find((s) => s.key === enquiry.status)?.label ?? enquiry.status;
  const trackUrl = `${base(site)}/track`;
  const first = enquiry.name?.trim().split(/\s+/)[0] ?? "";

  const html = shell(site, {
    preheader: copy.pre,
    eyebrow: kind === "created" ? "Enquiry received" : "Status update",
    title: copy.title,
    body: `
<p style="margin:0 0 20px">${first ? `Hi ${esc(first)},<br>` : ""}${esc(copy.lead)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.soft};border:1px solid ${C.line};border-radius:14px"><tr><td style="padding:22px 24px 8px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    ${kv("Ticket number", esc(enquiry.ref), true)}
    ${kv("Current status", `<span style="display:inline-block;background:${C.brand};color:${C.ink};border-radius:999px;padding:4px 14px;font:800 13px/1.5 ${FONT}">${esc(label)}</span>`)}
  </table></td></tr></table>
${tracker(enquiry.status)}
<div style="padding-top:18px">${button("Track my enquiry", trackUrl)}${button("Call us", `tel:${site.phone.replace(/[^+\d]/g, "")}`, "ghost")}${
      site.whatsapp ? button("WhatsApp", `https://wa.me/${digits(site.whatsapp)}?text=${encodeURIComponent(`Hello ${site.name}, my ticket number is ${enquiry.ref}.`)}`, "ghost") : ""
    }</div>
<p style="margin:14px 0 0;font-size:13px;color:${C.muted}">For your privacy this email only contains your ticket number and status, never the details of your requirement.</p>`,
    footerNote: `You're receiving this because you asked for updates on enquiry <strong>${esc(enquiry.ref)}</strong>.`,
  });

  const text = [
    `${copy.title}`,
    "",
    first ? `Hi ${first},` : "Hello,",
    copy.lead,
    "",
    `Ticket number: ${enquiry.ref}`,
    `Status: ${label}`,
    "",
    `Track your enquiry: ${trackUrl}`,
    `Call: ${site.phone}`,
    "",
    `- ${site.name}`,
  ].join("\n");

  return {
    subject: kind === "created" ? `Enquiry ${enquiry.ref} received - ${site.name}` : `Enquiry ${enquiry.ref}: ${label}`,
    text,
    html,
  };
}

/** Verification code (filing an enquiry or tracking one). */
export function otpEmail(site: Site, o: { code: string; purpose: "file" | "track"; ttlMinutes: number }): Mail {
  const what = o.purpose === "file" ? "verify your email and send your enquiry" : "track your enquiry";
  const html = shell(site, {
    preheader: `Your verification code is ${o.code}. It expires in ${o.ttlMinutes} minutes.`,
    eyebrow: "Verification code",
    title: o.purpose === "file" ? "Verify your email" : "Track your enquiry",
    body: `
<p style="margin:0 0 22px">Use this code to ${esc(what)}:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background:${C.ink};border-radius:14px;padding:26px 12px">
  <div class="code" style="font:800 40px/1 'SFMono-Regular',Menlo,Consolas,monospace;letter-spacing:12px;color:${C.brand};padding-left:12px">${esc(o.code)}</div>
  <div style="font:500 12px/1 ${FONT};color:#94a3b8;padding-top:14px">Expires in ${o.ttlMinutes} minutes &middot; single use</div>
</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;background:#fffbeb;border:1px solid #fde68a;border-radius:12px"><tr><td style="padding:14px 18px;font:400 13px/1.6 ${FONT};color:#78350f">
  <strong>Never share this code.</strong> ${esc(site.name)} will never ask you for it by phone, WhatsApp or email.
</td></tr></table>
<p style="margin:20px 0 0;font-size:13px;color:${C.muted}">Didn't request this? You can safely ignore this email - nothing will happen without the code.</p>`,
  });
  return {
    subject: `${o.code} is your ${site.name} verification code`,
    text: `Your code to ${what} is ${o.code}.\nIt is valid for ${o.ttlMinutes} minutes and can be used once. Never share it with anyone.\nIf you did not request it, ignore this email.\n\n- ${site.name}`,
    html,
  };
}

/** Business inbox: a new enquiry arrived (full details). */
export function adminAlertEmail(site: Site, e: Enquiry): Mail {
  const adminUrl = `${base(site)}/admin/enquiries`;
  const row = (label: string, value: string) =>
    value ? `<tr><td style="padding:11px 0;border-bottom:1px solid ${C.line};width:34%;font:700 11px/1.4 ${FONT};letter-spacing:.1em;text-transform:uppercase;color:${C.muted};vertical-align:top">${esc(label)}</td>
<td style="padding:11px 0;border-bottom:1px solid ${C.line};font:600 15px/1.5 ${FONT};color:${C.text};vertical-align:top">${value}</td></tr>` : "";
  const phoneDigits = digits(e.phone);

  const html = shell(site, {
    preheader: `${e.name} (${e.phone}) - ${e.product || "general enquiry"}`,
    eyebrow: `New enquiry · ${e.ref}`,
    title: `${e.name} wants a quote`,
    body: `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  ${row("Name", esc(e.name))}
  ${row("Phone", `<a href="tel:${esc(e.phone.replace(/[^+\d]/g, ""))}" style="color:${C.text};text-decoration:none">${esc(e.phone)}</a>`)}
  ${row("Email", e.email ? `<a href="mailto:${esc(e.email)}" style="color:${C.brandDark};text-decoration:none">${esc(e.email)}</a>${e.emailVerified ? ` <span style="font:700 10px/1 ${FONT};color:${C.ok};background:#dcfce7;border-radius:999px;padding:3px 8px;vertical-align:middle">VERIFIED</span>` : ""}` : "")}
  ${row("Company", esc(e.company))}
  ${row("Product", esc(e.product))}
</table>
<div style="margin:22px 0 0;font:700 11px/1 ${FONT};letter-spacing:.12em;text-transform:uppercase;color:${C.muted}">Requirement</div>
<div style="margin-top:10px;background:${C.soft};border:1px solid ${C.line};border-left:4px solid ${C.brand};border-radius:10px;padding:16px 18px;font:400 15px/1.65 ${FONT};color:${C.text};white-space:pre-wrap">${esc(e.message)}</div>
<div style="padding-top:26px">${button("Open in admin", adminUrl)}${button("Call", `tel:${e.phone.replace(/[^+\d]/g, "")}`, "ghost")}${
      phoneDigits.length >= 8 ? button("WhatsApp", `https://wa.me/${phoneDigits}?text=${encodeURIComponent(`Hello ${e.name}, this is ${site.name} regarding your enquiry ${e.ref}.`)}`, "ghost") : ""
    }${e.email ? button("Reply", `mailto:${e.email}?subject=${encodeURIComponent(`Re: your enquiry ${e.ref}`)}`, "ghost") : ""}</div>`,
    footerNote: "Internal notification for the sales team. Replying to this email writes to the customer.",
  });

  const text = [
    `New enquiry ${e.ref}`,
    "",
    `Name: ${e.name}`,
    `Phone: ${e.phone}`,
    e.email ? `Email: ${e.email}${e.emailVerified ? " (verified)" : ""}` : false,
    e.company ? `Company: ${e.company}` : false,
    e.product ? `Product: ${e.product}` : false,
    "",
    "Requirement:",
    e.message,
    "",
    `Open in admin: ${adminUrl}`,
  ].filter((l): l is string => typeof l === "string").join("\n");

  return { subject: `New enquiry ${e.ref}: ${e.name}${e.product ? ` - ${e.product}` : ""}`, text, html };
}
