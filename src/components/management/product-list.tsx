"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Breadcrumb } from "@/components/management/breadcrumb";
import { ArrowRightIcon, SearchIcon, TagIcon } from "@/components/management/icons";
import { LevelBadge } from "@/components/inventory/level-badge";
import { useLevelText } from "@/hooks/use-level-text";
import { useSkippedProducts } from "@/hooks/use-resolved-products";
import { useSettings } from "@/hooks/use-settings";
import { getLevel } from "@/lib/levels";
import { parseRupiah } from "@/lib/management";
import type { LevelId } from "@/types/inventory";
import type { ManagementData } from "@/types/management";

export function ProductList({
  data,
  storeId,
  levelId,
  onBack,
  onBackToStores,
}: {
  data: ManagementData;
  storeId: string;
  levelId: LevelId;
  onBack: () => void;
  onBackToStores: () => void;
}) {
  const t = useTranslations("ProductList");
  const tManagement = useTranslations("Management");
  const { shortLabel } = useLevelText();
  const settings = useSettings();
  const [query, setQuery] = useState("");
  const store = data.stores.find((item) => item.id === storeId);
  const level = getLevel(levelId, settings.warnings);

  const skipReasonBySku = new Map(
    useSkippedProducts()
      .filter((skipped) => skipped.storeId === storeId && skipped.levelId === levelId)
      .map((skipped) => [skipped.sku, skipped.reasonLabel]),
  );

  const products = useMemo(() => {
    return data.products
      .filter((product) => product.storeId === storeId && product.levelId === levelId)
      .sort((a, b) => parseRupiah(b.valueLabel) - parseRupiah(a.valueLabel));
  }, [data.products, storeId, levelId]);

  const filtered = products.filter((product) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return (
      product.productName.toLowerCase().includes(needle) || product.sku.toLowerCase().includes(needle)
    );
  });

  if (!store) return null;

  return (
    <section className="overflow-hidden rounded-3xl bg-panel shadow-[0_1px_2px_rgb(19_41_75/0.04),0_12px_32px_rgb(19_41_75/0.05)] ring-1 ring-line">
      <div className="border-b border-line px-4 py-4 md:px-5">
        <Breadcrumb
          items={[
            { label: tManagement("allStores"), onSelect: onBackToStores },
            { label: store.name.replace("Ranch Market ", ""), onSelect: onBack },
            { label: t("itemsCount", { level: shortLabel(level), count: products.length }) },
          ]}
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-semibold">{store.name}</h2>
            <LevelBadge level={level} />
          </div>

          {products.length > 0 ? (
            <label className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-56 rounded-full border border-line bg-background py-2 pr-3 pl-9 text-sm outline-none focus:border-management focus:ring-4 focus:ring-management/15"
              />
            </label>
          ) : null}
        </div>
      </div>

      {products.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted md:px-5">{t("emptyLevel")}</p>
      ) : filtered.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted md:px-5">
          {t("emptyQuery", { query })}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[62rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold tracking-wide text-muted uppercase">
                <th className="px-4 py-2.5 md:px-5">{t("colProduct")}</th>
                <th className="px-4 py-2.5 text-right md:px-5">{t("colStock")}</th>
                <th className="px-4 py-2.5 text-right md:px-5">{t("colValue")}</th>
                <th className="px-4 py-2.5 md:px-5">{t("colReplace")}</th>
                <th className="px-4 py-2.5 md:px-5">{t("colMoveTo")}</th>
                <th className="px-4 py-2.5 md:px-5">{t("colNote")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const isDiscount = product.nextAction.startsWith("Diskon");
                const skipReason = skipReasonBySku.get(product.sku);
                return (
                  <tr key={product.sku} className="border-b border-line last:border-0 hover:bg-background">
                    <td className="px-4 py-3 md:px-5">
                      <p className="font-medium">{product.productName}</p>
                      <p className="text-xs text-muted">{product.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums md:px-5">{product.stock}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums md:px-5">
                      {product.valueLabel}
                    </td>
                    <td className="px-4 py-3 md:px-5">
                      <span className="inline-flex items-center rounded-full bg-background px-2.5 py-1 text-xs font-medium">
                        {product.replacement}
                      </span>
                    </td>
                    <td className="px-4 py-3 md:px-5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          isDiscount ? "bg-warning/10 text-warning" : "bg-accent/10 text-accent"
                        }`}
                      >
                        {isDiscount ? <TagIcon className="size-3" /> : <ArrowRightIcon className="size-3" />}
                        {product.nextAction}
                      </span>
                    </td>
                    <td className="px-4 py-3 md:px-5">
                      {skipReason ? (
                        <span className="inline-flex items-center rounded-full bg-skipped-soft px-2.5 py-1 text-xs font-medium text-skipped">
                          {t("notDoneReason", { reason: skipReason })}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="px-4 py-3 text-xs text-muted md:px-5">{t("footerNote")}</p>
    </section>
  );
}
