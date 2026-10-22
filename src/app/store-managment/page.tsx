import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ManagementBoard } from "@/components/management/management-board";
import board from "@/data/layar-b.json";
import { requireRole } from "@/server/auth";
import { storeManagementRole } from "@/types/dashboard";
import type { ManagementData } from "@/types/management";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Common");
  return { title: t("managementTitle") };
}

export const instant = false;

export default async function StoreManagementPage() {
  const t = await getTranslations("Common");

  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted">{t("preparingPage")}</p>}>
      <ManagementOverview />
    </Suspense>
  );
}

async function ManagementOverview() {
  const user = await requireRole(storeManagementRole);

  return <ManagementBoard data={board as ManagementData} user={user} />;
}
