"use client";

import { useTranslations } from "next-intl";
import type { LevelTone } from "@/types/inventory";

const legend: { tone: LevelTone; labelKey: "watchOnly" | "needsAttention" | "mostUrgent"; dot: string }[] = [
  { tone: "neutral", labelKey: "watchOnly", dot: "bg-muted" },
  { tone: "attention", labelKey: "needsAttention", dot: "bg-warning" },
  { tone: "urgent", labelKey: "mostUrgent", dot: "bg-danger" },
];

export function LevelLegend() {
  const t = useTranslations("LevelLegend");

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
      {legend.map((item) => (
        <span key={item.tone} className="flex items-center gap-1.5">
          <span className={`size-2 rounded-full ${item.dot}`} />
          {t(item.labelKey)}
        </span>
      ))}
    </div>
  );
}
