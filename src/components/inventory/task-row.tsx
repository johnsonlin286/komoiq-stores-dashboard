import { LevelBadge } from "@/components/inventory/level-badge";
import { Button } from "@/components/ui/button";
import { getLevel } from "@/lib/levels";
import type { StoreTask } from "@/types/inventory";

const rails = {
  fresh: "border-l-danger",
  other: "border-l-slow",
} as const;

const urgentWash = {
  fresh: "bg-[#fff7f6]",
  other: "bg-[#f3faf9]",
} as const;

export function TaskRow({
  task,
  onAct,
}: {
  task: StoreTask;
  onAct: (task: StoreTask) => void;
}) {
  const level = getLevel(task.levelId);

  return (
    <li
      className={`flex flex-col gap-4 border-b border-l-4 border-b-line px-4 py-4 last:border-b-0 sm:flex-row sm:items-center md:px-5 ${rails[level.kind]} ${level.tone === "urgent" ? urgentWash[level.kind] : ""}`}
    >
      <div className="min-w-0 flex-1">
        <LevelBadge level={level} />
        <p className="mt-2 text-base font-semibold tracking-tight">{task.productName}</p>
        <p className="mt-0.5 text-sm text-muted">{task.detail}</p>
      </div>
      <Button className="shrink-0 sm:min-w-44" onClick={() => onAct(task)}>
        {task.actionLabel}
      </Button>
    </li>
  );
}
