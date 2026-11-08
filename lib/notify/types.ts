import type { NotificationLog } from "@/lib/types";

export type Channel = NotificationLog["channel"];

export type Outbound = {
  to: string; // address / phone number
  subject: string; // email only
  text: string;
  html?: string;
  replyTo?: string;
};

/**
 * A delivery channel. Only email is wired up today. SMS (MSG91) and WhatsApp (Meta Cloud API) can be
 * added later by implementing this interface in lib/notify/providers/ and registering it in
 * lib/notify/index.ts - nothing else in the app needs to change.
 */
export interface Provider {
  channel: Channel;
  configured(): boolean;
  send(msg: Outbound): Promise<void>;
}
