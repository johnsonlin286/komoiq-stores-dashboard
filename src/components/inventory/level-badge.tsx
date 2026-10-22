"use client";

import { useLevelText } from "@/hooks/use-level-text";
import type { LevelDefinition, LevelTone } from "@/types/inventory";

// One urgency scale for every level (fresh or not): neutral (grey, watch
// only) → needs attention (amber) → most urgent (red). Color is no longer
// split by item kind, so e.g. "3 months" never looks "safer" than
// "2 weeks" just because its color happened to be darker.
const toneStyles: Record<LevelTone, { pill: string; dot: string }> = {
  neutral: { pill: "bg-skipped-soft text-skipped", dot: "bg-skipped" },
  attention: { pill: "bg-attention-soft text-warning", dot: "bg-warning" },
  urgent: { pill: "bg-danger text-panel", dot: "bg-panel" },
};

export function LevelBadge({ level }: { level: LevelDefinition }) {
  const { label } = useLevelText();
  const style = toneStyles[level.tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.pill}`}
    >
      <span className={`size-1.5 rounded-full ${style.dot}`} />
      {label(level)}
    </span>
  );
}
