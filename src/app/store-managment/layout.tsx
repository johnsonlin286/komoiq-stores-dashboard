import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/server/auth";
import { storeManagementRole } from "@/types/dashboard";

export const instant = false;

export default async function StoreManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("Common");

  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted">{t("preparingPage")}</p>}>
      <StoreManagementGate>{children}</StoreManagementGate>
    </Suspense>
  );
}

async function StoreManagementGate({ children }: { children: React.ReactNode }) {
  await requireRole(storeManagementRole);
  return children;
}
