import { Suspense } from "react";
import { requireRole } from "@/server/auth";
import { storeManagementRole } from "@/types/dashboard";

export const instant = false;

export default function StoreManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted">Menyiapkan halaman…</p>}>
      <StoreManagementGate>{children}</StoreManagementGate>
    </Suspense>
  );
}

async function StoreManagementGate({ children }: { children: React.ReactNode }) {
  await requireRole(storeManagementRole);
  return children;
}
