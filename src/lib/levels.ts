import settingsJson from "@/data/settings.json";
import type {
  LevelDefinition,
  LevelId,
  LevelTone,
  WarningSettings,
} from "@/types/inventory";

const freshIds: LevelId[] = ["fresh-1", "fresh-2", "fresh-3"];
const otherIds: LevelId[] = ["other-2w", "other-1m", "other-3m", "other-6m"];

export function getWarningSettings(): WarningSettings {
  return settingsJson;
}

export function getLevels(settings: WarningSettings = getWarningSettings()) {
  return [
    ...freshIds.map((id, index) =>
      defineLevel(id, "fresh", settings.freshDays[index] ?? 0, index, settings.freshDays.length),
    ),
    ...otherIds.map((id, index) =>
      defineLevel(id, "other", settings.otherDays[index] ?? 0, index, settings.otherDays.length),
    ),
  ];
}

export function getLevel(levelId: LevelId) {
  const level = getLevels().find((item) => item.id === levelId);
  if (!level) {
    throw new Error(`Level tidak dikenal: ${levelId}`);
  }
  return level;
}

function defineLevel(
  id: LevelId,
  kind: "fresh" | "other",
  days: number,
  index: number,
  length: number,
): LevelDefinition {
  return {
    id,
    kind,
    days,
    label: levelLabel(kind, days),
    shortLabel: daySpan(days),
    tone: levelTone(index, length),
  };
}

function levelLabel(kind: "fresh" | "other", days: number) {
  const span = daySpan(days);
  return kind === "fresh" ? `Segar · ${span}` : span;
}

function daySpan(days: number) {
  if (days === 14) return "2 minggu";
  if (days === 30) return "1 bulan";
  if (days === 90) return "3 bulan";
  if (days === 180) return "6 bulan";
  if (days === 1) return "1 hari";
  return `${days} hari`;
}

function levelTone(index: number, length: number): LevelTone {
  if (index === length - 1) return "urgent";
  if (index === 0) return "neutral";
  return "attention";
}
