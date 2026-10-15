"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { Confirmation, StoreTask } from "@/types/inventory";
import type { CurrentUser } from "@/types/dashboard";

const UNDO_SECONDS = 8;
const STORAGE_KEY = "inventory-optimizer:layar-a:reset";

type UndoState = {
  taskId: string;
  seconds: number;
};

const listeners = new Set<() => void>();
let memory: Confirmation[] | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  for (const listener of listeners) listener();
}

function clientSnapshot(fallback: Confirmation[]) {
  if (memory === undefined) {
    memory = readStored() ?? fallback;
  }
  return memory;
}

function persist(next: Confirmation[]) {
  memory = next;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emit();
}

export function useTaskBoard(
  tasks: StoreTask[],
  seeded: Confirmation[],
  user: CurrentUser,
) {
  const confirmations = useSyncExternalStore(
    subscribe,
    () => clientSnapshot(seeded),
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
    persist([
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
    persist(confirmations.filter((item) => item.taskId !== undo.taskId));
    setUndo(null);
  }

  // restore all tasks
  function restoreAllTasks() {
    persist([]);
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

function readStored() {
  if (typeof sessionStorage === "undefined") return null;

  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "");
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(isConfirmation);
  } catch {
    return null;
  }
}

function isConfirmation(value: unknown): value is Confirmation {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<Confirmation>;
  return typeof record.taskId === "string" && typeof record.done === "boolean";
}
