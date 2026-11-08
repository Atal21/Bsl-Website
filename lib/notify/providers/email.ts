import nodemailer, { type Transporter } from "nodemailer";
import type { Provider } from "../types";

const g = globalThis as unknown as { __smtp?: Transporter };

function transport() {
  if (!g.__smtp) {
    const port = Number(process.env.SMTP_PORT) || 587;
    g.__smtp = nodemailer.createTransport({
      host: process.env.SMTP_HOST?.trim(),
      port,
      // 465 = implicit TLS; everything else (587/25) starts plain and upgrades with STARTTLS.
      // (SMTP_SECURE=true on port 587 is a common mistake and breaks the handshake, so the port decides.)
      secure: port === 465,
      requireTLS: port !== 465,
      // Gmail shows app passwords as "abcd efgh ijkl mnop" - the spaces are not part of the password.
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER.trim(),
            pass: (process.env.SMTP_PASS ?? "").replace(/\s+/g, ""),
          }
        : undefined,
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 12000,
    });
  }
  return g.__smtp;
}

/** Used by the diagnostics endpoint: connects and authenticates without sending anything. */
export async function verifySmtp(): Promise<{ ok: boolean; detail: string }> {
  try {
    await transport().verify();
    return { ok: true, detail: "Connected and authenticated" };
  } catch (e) {
    g.__smtp = undefined;
    return { ok: false, detail: e instanceof Error ? e.message : "Failed" };
  }
}

export const emailProvider: Provider = {
  channel: "email",
  configured: () => !!process.env.SMTP_HOST,
  async send({ to, subject, text, html, replyTo }) {
    await transport().sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
  },
};
