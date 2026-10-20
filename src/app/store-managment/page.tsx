import type { Metadata } from "next";
import { Suspense } from "react";
import { ManagementBoard } from "@/components/management/management-board";
import board from "@/data/layar-b.json";
import { requireRole } from "@/server/auth";
import { storeManagementRole } from "@/types/dashboard";
import type { ManagementData } from "@/types/management";

export const metadata: Metadata = {
  title: "Manajemen",
};

export const instant = false;

export default function StoreManagementPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted">Menyiapkan halaman…</p>}>
      <ManagementOverview />
    </Suspense>
  );
}

async function ManagementOverview() {
  const user = await requireRole(storeManagementRole);

  return <ManagementBoard data={board as ManagementData} user={user} />;
}
