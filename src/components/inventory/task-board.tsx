"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { DashboardSwitchLink } from "@/components/auth/dashboard-switch-link";
import { LanguageToggle } from "@/components/common/language-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import { CompletedList } from "@/components/inventory/completed-list";
import { ConfirmDialog } from "@/components/inventory/confirm-dialog";
import { SummaryStats } from "@/components/inventory/summary-stats";
import { TaskRow } from "@/components/inventory/task-row";
import { Button } from "@/components/ui/button";
import { useTaskBoard } from "@/hooks/use-task-board";
import { useJakartaClock } from "@/hooks/use-jakarta-clock";
import { useSettings } from "@/hooks/use-settings";
import { getLevel } from "@/lib/levels";
import { parseRupiah } from "@/lib/rupiah";
import type { Confirmation, StoreTask, WarningSettings } from "@/types/inventory";
import type { CurrentUser } from "@/types/dashboard";

type TaskBoardProps = {
  storeName: string;
  wasteValue: string;
  wasteDetail: string;
  tasks: StoreTask[];
  confirmations: Confirmation[];
  user: CurrentUser;
};

export function TaskBoard({
  storeName,
  wasteValue,
  wasteDetail,
  tasks,
  confirmations,
  user,
}: TaskBoardProps) {
  const t = useTranslations("TaskBoard");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const clock = useJakartaClock();
  const settings = useSettings();
  const board = useTaskBoard(tasks, confirmations, user);
  const [selected, setSelected] = useState<StoreTask | null>(null);
  // "Later" just reorders a task to the bottom of today's queue — it stays
  // in today's locked batch (see below), it just renders last.
  const [laterIds, setLaterIds] = useState<Set<string>>(new Set());

  // Langkah 3: "today's batch" is the top maxPerDay tasks by value. Deps
  // deliberately exclude `confirmations`/`board` — finishing a task moves
  // its id from open to completed but can't pull a new one into the batch,
  // since brief says the rest waits for tomorrow, not that today's list
  // keeps refilling. It does still follow Settings live if
  // maxPerDay/warnings change mid-session.
  const todaysBatchIds = useMemo(
    () => pickTodaysBatch(tasks, settings.warnings, settings.tasks.maxPerDay),
    [tasks, settings.warnings, settings.tasks.maxPerDay],
  );

  const freshAtRisk = board.openTasks.filter(
    (task) => getLevel(task.levelId, settings.warnings).kind === "fresh",
  ).length;
  const slowMoving = board.openTasks.length - freshAtRisk;

  const visibleTasks = sortOpenTasks(board.openTasks, settings.warnings, laterIds).filter((task) =>
    todaysBatchIds.has(task.id),
  );
  const deferredCount = board.openTasks.length - visibleTasks.length;
  const completedToday = board.completed.filter((row) => todaysBatchIds.has(row.task.id));
  const todaysTotal = todaysBatchIds.size;
  const progress = todaysTotal === 0 ? 0 : (completedToday.length / todaysTotal) * 100;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 bg-foreground text-panel">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-sidebar-muted uppercase">
              {tCommon("brand")}
            </p>
            <p className="text-sm font-medium">{tCommon("productName")}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle currentLocale={locale} />
            <DashboardSwitchLink
              user={user}
              href="/store-managment"
              label={t("switchToManagement")}
            />
            <p className="hidden text-right sm:block">
              <span className="block text-sm font-medium">{user.name}</span>
              <span className="text-xs text-sidebar-muted">{t("roleLabel")}</span>
            </p>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted">{t("morningTasks")}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-[2.5rem] md:leading-tight">
              {storeName}
            </h1>
          </div>
          <p className="rounded-full bg-panel px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-line">
            {t("todayAt", { date: clock.date ? ` ${clock.date}` : "" })}{" "}
            <span className="tabular-nums">{clock.time || "—"}</span>
          </p>
        </div>

        <SummaryStats
          freshAtRisk={freshAtRisk}
          slowMoving={slowMoving}
          openTasks={visibleTasks.length}
          wasteValue={wasteValue}
          wasteDetail={wasteDetail}
        />

        <section className="overflow-hidden rounded-3xl bg-panel shadow-[0_1px_2px_rgb(19_41_75/0.04),0_12px_32px_rgb(19_41_75/0.05)] ring-1 ring-line">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-4 md:px-5">
            <h2 className="text-lg font-semibold">{t("tasksSection")}</h2>
            <p className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted">
              {t("waiting", { count: visibleTasks.length })}
            </p>
          </div>
          {board.openTasks.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted md:px-5">
              {t("allTasksDone")}
            </p>
          ) : visibleTasks.length > 0 ? (
            <ol>
              {visibleTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onAct={setSelected}
                  onLater={(laterTask) =>
                    setLaterIds((prev) => new Set(prev).add(laterTask.id))
                  }
                />
              ))}
            </ol>
          ) : null}
          {deferredCount > 0 ? (
            <p className="border-t border-line px-4 py-3 text-center text-xs text-muted md:px-5">
              {t("deferredToTomorrow", { count: deferredCount })}
            </p>
          ) : null}
        </section>

        <section className="overflow-hidden rounded-3xl bg-panel shadow-[0_1px_2px_rgb(19_41_75/0.04),0_12px_32px_rgb(19_41_75/0.05)] ring-1 ring-line">
          <div className="border-b border-line px-4 py-4 md:px-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold">{t("completedSection")}</h2>
              <p className="text-sm font-medium text-muted">
                {t("completedOf", { done: completedToday.length, total: todaysTotal })}
              </p>
              <Button size="sm" variant="secondary" onClick={() => board.restoreAllTasks()}>
                {t("restoreAll")}
              </Button>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-done"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <CompletedList rows={board.completed} />
        </section>
      </main>

      <ConfirmDialog
        task={selected}
        onClose={() => setSelected(null)}
        onDone={(task) => {
          board.markDone(task);
          setSelected(null);
        }}
        onSkip={(task, reason, note) => {
          board.markSkipped(task, reason, note);
          setSelected(null);
        }}
      />

      {board.undoTask ? (
        <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
          <div
            role="status"
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-foreground text-sm text-panel shadow-xl"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <p>{t("recorded", { product: board.undoTask.productName })}</p>
              <Button size="sm" variant="inverse" onClick={board.undoLast}>
                {t("undo", { seconds: board.undoSeconds })}
              </Button>
            </div>
            <div className="h-1 bg-white/15">
              <div
                className="h-full bg-accent"
                style={{ width: `${(board.undoSeconds / 8) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Langkah 3: sorted by Rupiah value, highest first (level-urgency breaks
// ties); tasks the manager pushed to "Later" always sink to the bottom,
// regardless of value, since snoozing is meant to get them out of the way.
function sortOpenTasks(tasks: StoreTask[], settings: WarningSettings, laterIds: Set<string>) {
  return [...tasks].sort((a, b) => {
    const laterDiff = Number(laterIds.has(a.id)) - Number(laterIds.has(b.id));
    if (laterDiff !== 0) return laterDiff;

    const valueDiff = parseRupiah(b.valueLabel) - parseRupiah(a.valueLabel);
    if (valueDiff !== 0) return valueDiff;

    const left = getLevel(a.levelId, settings);
    const right = getLevel(b.levelId, settings);
    const category = Number(left.kind !== "fresh") - Number(right.kind !== "fresh");
    return category || left.days - right.days;
  });
}

// Picks the top `maxPerDay` tasks by value across the whole list (open and
// already-completed alike) — this is "today's batch". Completing a task
// doesn't change the set, it just moves that id from open into completed.
function pickTodaysBatch(tasks: StoreTask[], settings: WarningSettings, maxPerDay: number) {
  const sorted = [...tasks].sort((a, b) => {
    const valueDiff = parseRupiah(b.valueLabel) - parseRupiah(a.valueLabel);
    if (valueDiff !== 0) return valueDiff;

    const left = getLevel(a.levelId, settings);
    const right = getLevel(b.levelId, settings);
    const category = Number(left.kind !== "fresh") - Number(right.kind !== "fresh");
    return category || left.days - right.days;
  });
  return new Set(sorted.slice(0, maxPerDay).map((task) => task.id));
}
