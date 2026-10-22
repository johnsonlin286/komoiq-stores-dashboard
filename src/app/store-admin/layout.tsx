import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/server/auth";
import { storeAdminRole } from "@/types/dashboard";

export const instant = false;

export default async function StoreAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("Common");

  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted">{t("preparingTasks")}</p>}>
      <StoreAdminGate>{children}</StoreAdminGate>
    </Suspense>
  );
}

async function StoreAdminGate({ children }: { children: React.ReactNode }) {
  await requireRole(storeAdminRole);
  return children;
}
