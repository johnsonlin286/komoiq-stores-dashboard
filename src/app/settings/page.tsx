import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { SettingsPage } from "@/components/settings/settings-page";
import { requireRole } from "@/server/auth";
import { storeManagementRole } from "@/types/dashboard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Common");
  return { title: t("settingsTitle") };
}

export const instant = false;

export default async function SettingsRoutePage() {
  const t = await getTranslations("Common");

  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted">{t("preparingPage")}</p>}>
      <SettingsOverview />
    </Suspense>
  );
}

async function SettingsOverview() {
  const user = await requireRole(storeManagementRole);

  return <SettingsPage user={user} />;
}
