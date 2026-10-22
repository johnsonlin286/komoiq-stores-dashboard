"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { DashboardSwitchLink } from "@/components/auth/dashboard-switch-link";
import { LanguageToggle } from "@/components/common/language-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import { ProductList } from "@/components/management/product-list";
import { StoreLevelTiles } from "@/components/management/store-level-tiles";
import { StoreList } from "@/components/management/store-list";
import { SummaryStats } from "@/components/management/summary-stats";
import { useManagementBoard } from "@/hooks/use-management-board";
import { useResolvedProducts } from "@/hooks/use-resolved-products";
import { applyResolvedProducts } from "@/lib/management";
import type { CurrentUser } from "@/types/dashboard";
import type { ManagementData } from "@/types/management";

export function ManagementBoard({
  data,
  user,
}: {
  data: ManagementData;
  user: CurrentUser;
}) {
  const t = useTranslations("Management");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const board = useManagementBoard();
  const resolved = useResolvedProducts();
  const effectiveData = useMemo(() => applyResolvedProducts(data, resolved), [data, resolved]);
  const onStoresStep = board.step.view === "stores";

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b-[3px] border-management-line bg-management text-panel">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-management-muted uppercase">
              {tCommon("brand")}
            </p>
            <p className="text-sm font-medium">{tCommon("productName")}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle currentLocale={locale} />
            <Link
              href="/settings"
              className="inline-flex h-9 items-center rounded-xl border border-white/20 bg-white/10 px-3 text-xs font-medium text-panel transition hover:bg-white/20"
            >
              {t("settingsLink")}
            </Link>
            <DashboardSwitchLink user={user} href="/store-admin" label={t("switchToStore")} />
            <p className="hidden text-right sm:block">
              <span className="block text-sm font-medium">{user.name}</span>
              <span className="text-xs text-management-muted">{t("roleLabel")}</span>
            </p>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 md:px-6 md:py-8">
        <div>
          <p className="text-sm font-medium text-muted">{t("eyebrow")}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-[2.5rem] md:leading-tight">
            {t("heading")}
          </h1>
          {onStoresStep ? (
            <p className="mt-1 max-w-2xl text-sm text-muted">{t("subtitle")}</p>
          ) : null}
        </div>

        {onStoresStep ? <SummaryStats data={effectiveData} /> : null}

        {renderStep(board, effectiveData)}
      </main>
    </div>
  );
}

function renderStep(board: ReturnType<typeof useManagementBoard>, data: ManagementData) {
  const step = board.step;

  switch (step.view) {
    case "stores":
      return <StoreList data={data} onSelectStore={board.goToStore} />;
    case "store":
      return (
        <StoreLevelTiles
          data={data}
          storeId={step.storeId}
          onBack={board.goToStores}
          onSelectLevel={(levelId) => board.goToProducts(step.storeId, levelId)}
        />
      );
    case "products":
      return (
        <ProductList
          data={data}
          storeId={step.storeId}
          levelId={step.levelId}
          onBack={() => board.goToStore(step.storeId)}
          onBackToStores={board.goToStores}
        />
      );
    default:
      return null;
  }
}
