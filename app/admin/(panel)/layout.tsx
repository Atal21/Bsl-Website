import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { getStore } from "@/lib/db";
import { FALLBACK_LOGO } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin panel", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const store = await getStore();
  const [newCount, site] = await Promise.all([store.enquiries.count({ filter: { status: "new" } }), getSettings().catch(() => null)]);
  return (
    <AdminShell user={{ name: session.name, email: session.email }} newCount={newCount} brand={{ name: site?.name || "Admin", logo: site?.logo || FALLBACK_LOGO }}>
      {children}
    </AdminShell>
  );
}
