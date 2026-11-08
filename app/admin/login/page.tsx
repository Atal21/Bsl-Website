import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";
import { getSettings } from "@/lib/data";
import { FALLBACK_LOGO } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default async function LoginPage() {
  const site = await getSettings().catch(() => null);
  return <LoginForm brand={{ name: site?.name ?? "", logo: site?.logo || FALLBACK_LOGO }} />;
}
