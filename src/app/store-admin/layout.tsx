import { Suspense } from "react";
import { requireRole } from "@/server/auth";
import { storeAdminRole } from "@/types/dashboard";

export const instant = false;

export default function StoreAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <p className="p-8 text-sm text-muted">Menyiapkan tugas hari ini…</p>
      }
    >
      <StoreAdminGate>{children}</StoreAdminGate>
    </Suspense>
  );
}

async function StoreAdminGate({ children }: { children: React.ReactNode }) {
  await requireRole(storeAdminRole);
  return children;
}
