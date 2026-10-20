"use client";

import { useState } from "react";
import { DashboardSwitchLink } from "@/components/auth/dashboard-switch-link";
import { LogoutButton } from "@/components/auth/logout-button";
import { CompletedList } from "@/components/inventory/completed-list";
import { ConfirmDialog } from "@/components/inventory/confirm-dialog";
import { SummaryStats } from "@/components/inventory/summary-stats";
import { TaskRow } from "@/components/inventory/task-row";
import { Button } from "@/components/ui/button";
import { useTaskBoard } from "@/hooks/use-task-board";
import { useJakartaClock } from "@/hooks/use-jakarta-clock";
import { getLevel } from "@/lib/levels";
import type { Confirmation, StoreTask } from "@/types/inventory";
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
  const clock = useJakartaClock();
  const board = useTaskBoard(tasks, confirmations, user);
  const [selected, setSelected] = useState<StoreTask | null>(null);
  const freshAtRisk = board.openTasks.filter(
    (task) => getLevel(task.levelId).kind === "fresh",
  ).length;
  const slowMoving = board.openTasks.length - freshAtRisk;

  const progress = board.total === 0 ? 0 : (board.completed.length / board.total) * 100;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 bg-foreground text-panel">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-sidebar-muted uppercase">
              KomoIQ
            </p>
            <p className="text-sm font-medium">Inventory Optimizer</p>
          </div>
          <div className="flex items-center gap-3">
            <DashboardSwitchLink user={user} href="/store-managment" label="Lihat sebagai manajemen" />
            <p className="hidden text-right sm:block">
              <span className="block text-sm font-medium">{user.name}</span>
              <span className="text-xs text-sidebar-muted">Manajer toko</span>
            </p>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted">Tugas pagi</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-[2.5rem] md:leading-tight">
              {storeName}
            </h1>
          </div>
          <p className="rounded-full bg-panel px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-line">
            Hari ini{clock.date ? ` ${clock.date}` : ""}{" "}
            <span className="tabular-nums">{clock.time || "—"}</span>
          </p>
        </div>

        <SummaryStats
          freshAtRisk={freshAtRisk}
          slowMoving={slowMoving}
          openTasks={board.openTasks.length}
          wasteValue={wasteValue}
          wasteDetail={wasteDetail}
        />

        <section className="overflow-hidden rounded-3xl bg-panel shadow-[0_1px_2px_rgb(19_41_75/0.04),0_12px_32px_rgb(19_41_75/0.05)] ring-1 ring-line">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-4 md:px-5">
            <h2 className="text-lg font-semibold">Tugas hari ini</h2>
            <p className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted">
              {board.openTasks.length} menunggu
            </p>
          </div>
          {board.openTasks.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted md:px-5">
              Semua tugas hari ini sudah dikonfirmasi.
            </p>
          ) : (
            <ol>
              {sortOpenTasks(board.openTasks).map((task) => (
                <TaskRow key={task.id} task={task} onAct={setSelected} />
              ))}
            </ol>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl bg-panel shadow-[0_1px_2px_rgb(19_41_75/0.04),0_12px_32px_rgb(19_41_75/0.05)] ring-1 ring-line">
          <div className="border-b border-line px-4 py-4 md:px-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold">Tugas selesai</h2>
              <p className="text-sm font-medium text-muted">
                {board.completed.length} dari {board.total}
              </p>
              <Button size="sm" variant="secondary" onClick={() => board.restoreAllTasks()}>
                Restore All
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
              <p>{board.undoTask.productName} dicatat.</p>
              <Button size="sm" variant="inverse" onClick={board.undoLast}>
                Urungkan · {board.undoSeconds} dtk
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

function sortOpenTasks(tasks: StoreTask[]) {
  return [...tasks].sort((a, b) => {
    const left = getLevel(a.levelId);
    const right = getLevel(b.levelId);
    const category = Number(left.kind !== "fresh") - Number(right.kind !== "fresh");
    return category || left.days - right.days;
  });
}
