"use client";

import { useLevelText } from "@/hooks/use-level-text";
import type { LevelDefinition, TaskStatus } from "@/types/inventory";

// Langkah 3 chip colors for the store screen: yellow = slow, red = dead.
// (Running out = blue and Check list = gray come with their own flows in
// Langkah 5 and Langkah 4.)
const statusStyles: Record<TaskStatus, { pill: string; dot: string }> = {
  slow: { pill: "bg-slow-soft text-slow", dot: "bg-slow" },
  dead: { pill: "bg-danger text-panel", dot: "bg-panel" },
};

export function TaskStatusBadge({
  status,
  level,
}: {
  status: TaskStatus;
  level: LevelDefinition;
}) {
  const { statusLabel } = useLevelText();
  const style = statusStyles[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.pill}`}
    >
      <span className={`size-1.5 rounded-full ${style.dot}`} />
      {statusLabel(status, level)}
    </span>
  );
}
