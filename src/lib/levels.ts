import defaultSettings from "@/data/settings.json";
import type {
  LevelDefinition,
  LevelId,
  LevelTone,
  WarningSettings,
} from "@/types/inventory";

const freshIds: LevelId[] = ["fresh-1", "fresh-2", "fresh-3"];
const otherIds: LevelId[] = ["other-2w", "other-1m", "other-3m", "other-6m"];

// Fallback only — components read the live, editable value via
// useSettings() (see hooks/use-settings.ts) and pass it into getLevels().
export function getWarningSettings(): WarningSettings {
  return defaultSettings.warnings;
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

export function getLevel(levelId: LevelId, settings?: WarningSettings) {
  const level = getLevels(settings).find((item) => item.id === levelId);
  if (!level) {
    throw new Error(`Unknown level: ${levelId}`);
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
    spanKey: daySpanKey(days),
    tone: levelTone(index, length),
  };
}

// Maps a day count to a message key under Levels.span in the translation
// files (see src/hooks/use-level-text.ts for where this gets turned into
// display text) — kept as a key rather than literal text so the label is
// never frozen in one language.
function daySpanKey(days: number) {
  if (days === 14) return "w2";
  if (days === 30) return "m1";
  if (days === 90) return "m3";
  if (days === 180) return "m6";
  if (days === 1) return "d1";
  if (days === 2) return "d2";
  if (days === 3) return "d3";
  return `g:${days}`;
}

function levelTone(index: number, length: number): LevelTone {
  if (index === length - 1) return "urgent";
  if (index === 0) return "neutral";
  return "attention";
}
