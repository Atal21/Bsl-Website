import type { Metadata } from "next";
import TrackForm from "@/components/TrackForm";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Track your enquiry", robots: { index: false, follow: true } };

export default function TrackPage() {
  return (
    <section className="section">
      <div className="container-x max-w-xl">
        <p className="eyebrow">Enquiry status</p>
        <h1 className="font-display-tight mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Track your enquiry</h1>
        <p className="mt-3 text-slate-600">
          {env.otpEnabled()
            ? "Enter the email you used for your enquiry. We will send you a verification code."
            : "Enter your ticket number and the last 4 digits of your phone number."}
        </p>
        <div className="mt-8">
          <TrackForm otp={env.otpEnabled()} />
        </div>
      </div>
    </section>
  );
}
