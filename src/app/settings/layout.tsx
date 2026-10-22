import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/server/auth";
import { storeManagementRole } from "@/types/dashboard";

export const instant = false;

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("Common");

  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted">{t("preparingPage")}</p>}>
      <SettingsGate>{children}</SettingsGate>
    </Suspense>
  );
}

// Settings is Management-only — Store manager accounts don't get a link to
// it anywhere, and this gate keeps a direct URL visit from working either.
async function SettingsGate({ children }: { children: React.ReactNode }) {
  await requireRole(storeManagementRole);
  return children;
}
