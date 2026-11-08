import crypto from "node:crypto";
import { getSettings } from "@/lib/data";
import type { Store } from "@/lib/db/types";
import { env } from "@/lib/env";
import { nowIso } from "@/lib/api/http";
import type { Enquiry, NotificationLog } from "@/lib/types";
import { emailProvider } from "./providers/email";
import { adminAlertEmail, enquiryEmail } from "./templates";
import type { Channel, Outbound, Provider } from "./types";

// Register future providers here, e.g. sms: msg91Provider, whatsapp: metaWhatsappProvider.
const providers: Partial<Record<Channel, Provider>> = { email: emailProvider };

export const maskEmail = (e: string) => {
  const [user = "", domain = ""] = e.split("@");
  return `${user.slice(0, 1)}***@${domain}`;
};

export type DeliveryResult = NotificationLog["status"];

const withTimeout = <T>(p: Promise<T>, ms: number) =>
  Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error("Timed out")), ms))]);

/**
 * Sends one message. Never throws. Returns "sent" | "failed" | "skipped".
 * - provider configured -> real send
 * - not configured, development -> printed to the server console
 * - not configured, production -> skipped
 */
export async function deliver(channel: Channel, msg: Outbound, opts: { consoleBody?: string } = {}): Promise<{ status: DeliveryResult; error?: string }> {
  const provider = providers[channel];
  if (!provider) return { status: "skipped", error: `${channel} is not enabled` };
  if (!provider.configured()) {
    if (env.isProd()) {
      console.warn(`[notify] ${channel} not configured - message to ${channel === "email" ? maskEmail(msg.to) : "recipient"} skipped`);
      return { status: "skipped", error: `${channel} provider is not configured` };
    }
    console.log(`\n[notify:dev] ${channel} -> ${msg.to}\n  Subject: ${msg.subject}\n  ${(opts.consoleBody ?? msg.text).replace(/\n/g, "\n  ")}\n`);
    return { status: "skipped", error: "Printed to the server console (development, provider not configured)" };
  }
  try {
    await withTimeout(provider.send(msg), 15000);
    return { status: "sent" };
  } catch (e) {
    const error = e instanceof Error ? e.message.slice(0, 200) : "Send failed";
    console.error(`[notify] ${channel} send failed:`, error);
    return { status: "failed", error };
  }
}

/**
 * Ticket-created / status-changed email. Contains ONLY the ticket number and status - never the
 * customer's message, product, name or phone. Never throws and never affects the caller.
 */
export async function notifyEnquiry(store: Store, enquiry: Enquiry, kind: "created" | "status"): Promise<DeliveryResult | "not_opted_in"> {
  if (!enquiry.notifyEmail || !enquiry.email) return "not_opted_in";
  let result: { status: DeliveryResult; error?: string } = { status: "failed", error: "Unexpected error" };
  try {
    const site = await getSettings();
    const { subject, text, html } = enquiryEmail(site, enquiry, kind);
    result = await deliver("email", { to: enquiry.email, subject, text, html });
  } catch (e) {
    result = { status: "failed", error: e instanceof Error ? e.message.slice(0, 200) : "Error" };
  }
  try {
    await store.notifications.insert({
      _id: crypto.randomUUID(),
      enquiryId: enquiry._id,
      ref: enquiry.ref,
      channel: "email",
      kind,
      to: maskEmail(enquiry.email),
      status: result.status,
      ...(result.error ? { error: result.error } : {}),
      createdAt: nowIso(),
    });
  } catch (e) {
    console.error("[notify] could not write log", e);
  }
  return result.status;
}

/**
 * Tells the company inbox that a new enquiry arrived (full details, so the sales team can reply fast).
 * Goes to ADMIN_NOTIFY_EMAIL, or the contact email from Admin -> Settings. Never throws.
 */
export async function notifyAdminNewEnquiry(enquiry: Enquiry): Promise<DeliveryResult> {
  try {
    const site = await getSettings();
    const to = (process.env.ADMIN_NOTIFY_EMAIL || site.email || "").split(",")[0].trim();
    if (!to) return "skipped";
    const { subject, text, html } = adminAlertEmail(site, enquiry);
    const r = await deliver("email", { to, subject, text, html, replyTo: enquiry.email || undefined });
    return r.status;
  } catch (e) {
    console.error("[notify] admin alert failed", e instanceof Error ? e.message : e);
    return "failed";
  }
}
