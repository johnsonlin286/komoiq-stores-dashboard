"use client";

import { useTranslations } from "next-intl";
import { TaskStatusBadge } from "@/components/inventory/task-status-badge";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { getLevel } from "@/lib/levels";
import { findBestTodayPercent } from "@/lib/settings-store";
import type { StoreTask, TaskStatus } from "@/types/inventory";

// Row accent follows the task's own Slow/Dead status (same colors as its
// chip), not the fresh/non-fresh level kind — a row's rail used to be red
// for every fresh item regardless of status, which could contradict a
// yellow "Slow" chip sitting right next to it.
const rails: Record<TaskStatus, string> = {
  slow: "border-l-slow",
  dead: "border-l-danger",
};

const statusWash: Record<TaskStatus, string> = {
  slow: "",
  dead: "bg-[#fff7f6]",
};

export function TaskRow({
  task,
  onAct,
  onLater,
}: {
  task: StoreTask;
  onAct: (task: StoreTask) => void;
  onLater: (task: StoreTask) => void;
}) {
  const t = useTranslations("TaskBoard");
  const settings = useSettings();
  const level = getLevel(task.levelId, settings.warnings);
  const discountPercent = task.discount
    ? findBestTodayPercent(settings, task.discount.code)
    : undefined;
  const buttonLabel =
    discountPercent !== undefined
      ? t("priceToSellButton", { percent: discountPercent })
      : task.actionLabel;

  return (
    <li
      className={`flex flex-col gap-4 border-b border-l-4 border-b-line px-4 py-4 last:border-b-0 sm:flex-row sm:items-center md:px-5 ${rails[task.status]} ${statusWash[task.status]}`}
    >
      <div className="min-w-0 flex-1">
        <TaskStatusBadge status={task.status} level={level} />
        <p className="mt-2 text-base font-semibold tracking-tight">{task.productName}</p>
        <p className="mt-0.5 text-sm text-muted">{task.detail}</p>
        <p className="mt-0.5 text-xs font-medium text-muted">{task.valueLabel}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => onLater(task)}>
          {t("later")}
        </Button>
        <Button className="sm:min-w-44" onClick={() => onAct(task)}>
          {buttonLabel}
        </Button>
      </div>
    </li>
  );
}
