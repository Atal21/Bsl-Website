import SettingsManager from "@/components/admin/SettingsManager";
import { getAdminSession } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { mergeSettings } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const s = await getStore();
  const [saved, admins, session] = await Promise.all([s.settings.findById("site"), s.admins.find({ sort: { createdAt: 1 } }), getAdminSession()]);
  const { _id, ...settings } = mergeSettings(saved) as ReturnType<typeof mergeSettings> & { _id?: string };
  void _id;
  return (
    <SettingsManager
      initial={settings}
      admins={admins.map(({ passwordHash, ...a }) => (void passwordHash, a))}
      me={session?.id ?? ""}
    />
  );
}
