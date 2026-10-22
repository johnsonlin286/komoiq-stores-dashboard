"use client";

import { useTranslations } from "next-intl";
import type { LevelDefinition, TaskStatus } from "@/types/inventory";

// Turns a LevelDefinition's spanKey (see lib/levels.ts) into display text in
// the signed-in locale. `shortLabel` is just the day span ("2 weeks" / "2
// minggu"); `label` prefixes it with "Fresh ·" for fresh-kind levels, same
// as the old hardcoded "Segar · 2 minggu" strings did.
export function useLevelText() {
  const t = useTranslations("Levels");

  function shortLabel(level: LevelDefinition) {
    if (level.spanKey.startsWith("g:")) {
      return t("span.generic", { days: level.spanKey.slice(2) });
    }
    return t(`span.${level.spanKey}` as Parameters<typeof t>[0]);
  }

  function label(level: LevelDefinition) {
    const span = shortLabel(level);
    return level.kind === "fresh" ? `${t("freshPrefix")} · ${span}` : span;
  }

  // Langkah 3's store-screen chip: "{Slow/Dead} · fresh" for fresh items
  // (brief drops the specific day count here — it's still in the task
  // detail text), "{Slow/Dead} · {span}" for non-fresh. `status` comes from
  // the task's own data (backend's classification), not derived here.
  // Layar B keeps the old `label`/`shortLabel` format until its own rework
  // (Langkah 8).
  function statusLabel(status: TaskStatus, level: LevelDefinition) {
    const statusText = t(status === "dead" ? "statusDead" : "statusSlow");
    const span = level.kind === "fresh" ? t("freshPrefix").toLowerCase() : shortLabel(level);
    return `${statusText} · ${span}`;
  }

  return { shortLabel, label, statusLabel };
}
