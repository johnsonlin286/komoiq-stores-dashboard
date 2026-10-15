import { getLevels } from "@/lib/levels";
import type { LevelDefinition } from "@/types/inventory";

const freshPills = [
  "bg-[#fbeceb] text-[#9a534d]",
  "bg-[#f6d2cd] text-[#8e2a24]",
  "bg-danger text-panel",
] as const;

const freshDots = ["bg-[#e4b4ae]", "bg-[#c4564e]", "bg-panel"] as const;

const slowPills = [
  "bg-[#e7f6f4] text-[#3d7f78]",
  "bg-[#d2efeb] text-[#0e7c73]",
  "bg-[#b5e3dc] text-[#0a5c55]",
  "bg-danger text-panel",
] as const;

const slowDots = ["bg-[#9dccc6]", "bg-[#4ea89f]", "bg-slow", "bg-panel"] as const;

function shade(styles: readonly string[], index: number, count: number) {
  if (count <= 1) return styles[styles.length - 1];
  const slot = Math.round((index / (count - 1)) * (styles.length - 1));
  return styles[Math.min(slot, styles.length - 1)];
}

export function LevelBadge({ level }: { level: LevelDefinition }) {
  const steps = getLevels().filter((item) => item.kind === level.kind);
  const index = Math.max(
    0,
    steps.findIndex((item) => item.id === level.id),
  );
  const pills = level.kind === "fresh" ? freshPills : slowPills;
  const dots = level.kind === "fresh" ? freshDots : slowDots;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${shade(pills, index, steps.length)}`}
    >
      <span className={`size-1.5 rounded-full ${shade(dots, index, steps.length)}`} />
      {level.label}
    </span>
  );
}
