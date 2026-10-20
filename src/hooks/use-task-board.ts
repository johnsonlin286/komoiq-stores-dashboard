"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { readConfirmations, subscribeConfirmations, writeConfirmations } from "@/lib/confirmation-store";
import type { Confirmation, StoreTask } from "@/types/inventory";
import type { CurrentUser } from "@/types/dashboard";

const UNDO_SECONDS = 8;

type UndoState = {
  taskId: string;
  seconds: number;
};

export function useTaskBoard(
  tasks: StoreTask[],
  seeded: Confirmation[],
  user: CurrentUser,
) {
  const confirmations = useSyncExternalStore(
    subscribeConfirmations,
    () => readConfirmations(seeded),
    () => seeded,
  );
  const [undo, setUndo] = useState<UndoState | null>(null);
  const undoTaskId = undo?.taskId ?? null;

  useEffect(() => {
    if (!undoTaskId) return;

    const timer = window.setInterval(() => {
      setUndo((current) => {
        if (!current || current.taskId !== undoTaskId || current.seconds <= 1) return null;
        return { taskId: current.taskId, seconds: current.seconds - 1 };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [undoTaskId]);

  const confirmedIds = useMemo(
    () => new Set(confirmations.map((item) => item.taskId)),
    [confirmations],
  );

  const openTasks = tasks.filter((task) => !confirmedIds.has(task.id));
  const completed = confirmations
    .flatMap((confirmation) => {
      const task = tasks.find((item) => item.id === confirmation.taskId);
      return task ? [{ task, confirmation }] : [];
    })
    .sort(
      (a, b) => Date.parse(b.confirmation.at) - Date.parse(a.confirmation.at),
    );

  function record(confirmation: Confirmation) {
    writeConfirmations([
      ...confirmations.filter((item) => item.taskId !== confirmation.taskId),
      confirmation,
    ]);
    setUndo({ taskId: confirmation.taskId, seconds: UNDO_SECONDS });
  }

  function markDone(task: StoreTask) {
    record({
      taskId: task.id,
      userName: user.name,
      at: new Date().toISOString(),
      done: true,
      reason: null,
      note: null,
    });
  }

  function markSkipped(
    task: StoreTask,
    reason: Confirmation["reason"],
    note: string | null,
  ) {
    if (!reason) return;
    record({
      taskId: task.id,
      userName: user.name,
      at: new Date().toISOString(),
      done: false,
      reason,
      note,
    });
  }

  function undoLast() {
    if (!undo) return;
    writeConfirmations(confirmations.filter((item) => item.taskId !== undo.taskId));
    setUndo(null);
  }

  // restore all tasks — also clears whatever Layar B has derived from them
  function restoreAllTasks() {
    writeConfirmations([]);
    setUndo(null);
  }

  return {
    openTasks,
    completed,
    total: tasks.length,
    undoTask: undo ? (tasks.find((task) => task.id === undo.taskId) ?? null) : null,
    undoSeconds: undo?.seconds ?? 0,
    markDone,
    markSkipped,
    undoLast,
    restoreAllTasks,
  };
}
