"use client";

import { useTranslations } from "next-intl";
import { formatPercent, sumRupiahLabels } from "@/lib/management";
import type { ManagementData } from "@/types/management";

export function SummaryStats({ data }: { data: ManagementData }) {
  const t = useTranslations("Management");
  const averageWaste =
    data.stores.reduce((sum, store) => sum + store.wastePercent, 0) / data.stores.length;
  const bestStore = [...data.stores].sort((a, b) => a.wastePercent - b.wastePercent)[0];

  const cards = [
    {
      key: "stores",
      label: t("statStores"),
      value: String(data.stores.length),
      detail: t("statStoresDetail"),
      accent: "bg-management",
    },
    {
      key: "waste",
      label: t("statWaste"),
      value: formatPercent(averageWaste),
      detail: t("statWasteDetail"),
      accent: "bg-warning",
    },
    {
      key: "flagged",
      label: t("statFlagged"),
      value: String(data.products.length),
      detail: t("statFlaggedDetail"),
      accent: "bg-danger",
    },
    {
      key: "value",
      label: t("statValue"),
      value: sumRupiahLabels(data.levelTiles.map((tile) => tile.valueLabel)),
      detail: bestStore
        ? t("statValueBest", { store: bestStore.name.replace("Ranch Market ", "") })
        : "",
      accent: "bg-accent",
    },
  ] as const;

  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.key}
          className="overflow-hidden rounded-2xl bg-panel shadow-[0_1px_2px_rgb(19_41_75/0.04),0_10px_28px_rgb(19_41_75/0.05)] ring-1 ring-line"
        >
          <div className={`h-1 ${card.accent}`} />
          <div className="px-4 py-4 md:px-5">
            <p className="text-sm font-medium text-muted">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums md:text-3xl">
              {card.value}
            </p>
            <p className="mt-1 min-h-8 text-xs leading-4 text-muted">{card.detail}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
