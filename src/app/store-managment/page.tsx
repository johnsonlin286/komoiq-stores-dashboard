import type { Metadata } from "next";
import { Suspense } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireRole } from "@/server/auth";
import { storeManagementRole } from "@/types/dashboard";

export const metadata: Metadata = {
  title: "Manajemen",
};

export const instant = false;

export default function StoreManagementPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted">Menyiapkan halaman…</p>}>
      <ManagementPlaceholder />
    </Suspense>
  );
}

async function ManagementPlaceholder() {
  const user = await requireRole(storeManagementRole);

  return (
    <div className="min-h-dvh">
      <header className="border-b-[3px] border-management-line bg-management text-panel">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-management-muted uppercase">
              KomoIQ
            </p>
            <p className="text-sm font-medium">Inventory Optimizer</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden text-right sm:block">
              <span className="block text-sm font-medium">{user.name}</span>
              <span className="text-xs text-management-muted">Manajemen</span>
            </p>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto grid min-h-[70dvh] max-w-5xl place-items-center px-4 py-16 text-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Manajemen</h1>
          <p className="mt-3 text-sm text-muted">Halaman ini masih kosong.</p>
        </div>
      </main>
    </div>
  );
}
