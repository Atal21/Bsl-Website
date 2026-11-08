// Usage: npm run preview-emails   -> writes HTML previews to ./email-previews (open them in a browser)
import fs from "node:fs";
import path from "node:path";
import { seedSettings } from "./seed/settings";
import { adminAlertEmail, enquiryEmail, otpEmail } from "../lib/notify/templates";
import type { Enquiry } from "../lib/types";

const site = { ...seedSettings, url: process.env.PREVIEW_BASE_URL ?? "http://localhost:3000", address: "Plot 12, Industrial Area, Delhi" };
const enquiry: Enquiry = {
  _id: "x", ref: "BSL-2611-K7Q2M", notifyEmail: true, emailVerified: true, name: "Rahul Sharma", phone: "+91 98765 43210",
  email: "rahul@example.com", company: "Sharma Logistics", product: "Hydraulic Scissor Lift (Fixed)",
  message: "Need a 3 tonne lift, 3.5 m height, platform 3000 x 2000 mm, three phase supply.\nDelivery to Gurugram.",
  status: "new", notes: "", createdAt: new Date().toISOString(),
};

const out = path.join(process.cwd(), "email-previews");
fs.mkdirSync(out, { recursive: true });
const write = (name: string, m: { html: string }) => fs.writeFileSync(path.join(out, `${name}.html`), m.html);

write("otp-file", otpEmail(site, { code: "482915", purpose: "file", ttlMinutes: 5 }));
write("otp-track", otpEmail(site, { code: "073156", purpose: "track", ttlMinutes: 5 }));
write("enquiry-received", enquiryEmail(site, enquiry, "created"));
write("status-contacted", enquiryEmail(site, { ...enquiry, status: "contacted" }, "status"));
write("status-quoted", enquiryEmail(site, { ...enquiry, status: "quoted" }, "status"));
write("status-closed", enquiryEmail(site, { ...enquiry, status: "closed" }, "status"));
write("admin-new-enquiry", adminAlertEmail(site, enquiry));
console.log(`Wrote previews to ${out}`);
