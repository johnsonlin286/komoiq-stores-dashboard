"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getLevel } from "@/lib/levels";
import {
  reasonsForTask,
  type ReasonCode,
  type StoreTask,
} from "@/types/inventory";

type ConfirmDialogProps = {
  task: StoreTask | null;
  onClose: () => void;
  onDone: (task: StoreTask) => void;
  onSkip: (task: StoreTask, reason: ReasonCode, note: string | null) => void;
};

export function ConfirmDialog({ task, onClose, onDone, onSkip }: ConfirmDialogProps) {
  if (!task) return null;

  return (
    <ConfirmDialogPanel
      key={task.id}
      task={task}
      onClose={onClose}
      onDone={onDone}
      onSkip={onSkip}
    />
  );
}

function ConfirmDialogPanel({
  task,
  onClose,
  onDone,
  onSkip,
}: {
  task: StoreTask;
  onClose: () => void;
  onDone: (task: StoreTask) => void;
  onSkip: (task: StoreTask, reason: ReasonCode, note: string | null) => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const [mode, setMode] = useState<"choose" | "reason">("choose");
  const [reason, setReason] = useState<ReasonCode | "">("");
  const [note, setNote] = useState("");

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    closeRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const level = getLevel(task.levelId);
  const noteMissing = reason === "lainnya" && note.trim().length === 0;
  const canSave = reason !== "" && !noteMissing;
  const movement = task.toLabel
    ? `${task.quantityLabel}. Dari ${task.fromLabel} ke ${task.toLabel}.`
    : `${task.quantityLabel}. Di ${task.fromLabel}.`;

  return (
    <div className="fixed inset-0 z-40 grid place-items-end bg-[#13294b]/55 p-4 backdrop-blur-[2px] sm:place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="grid max-h-[90dvh] w-full max-w-lg gap-5 overflow-y-auto rounded-3xl bg-panel p-5 shadow-2xl ring-1 ring-line md:p-6"
      >
        <div className="grid gap-3">
          <p className="text-sm font-semibold text-accent">{level.label}</p>
          <h2 id={titleId} className="text-2xl font-semibold tracking-tight">
            {task.productName}
          </h2>
          <p className="text-sm text-muted">{task.detail}</p>
          <div className="rounded-2xl bg-background px-4 py-3">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">
              {task.actionLabel}
            </p>
            <p className="mt-1 text-sm font-medium">{movement}</p>
          </div>
        </div>

        {mode === "choose" ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <Button onClick={() => onDone(task)}>Ya, sudah dikerjakan</Button>
            <Button variant="secondary" onClick={() => setMode("reason")}>
              Tidak dikerjakan
            </Button>
          </div>
        ) : (
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (reason === "" || noteMissing) return;
              onSkip(task, reason, reason === "lainnya" ? note.trim() : null);
            }}
          >
            <fieldset className="grid gap-2">
              <legend className="text-sm font-semibold">Pilih alasan</legend>
              {reasonsForTask(task).map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm ${
                    reason === option.id
                      ? "border-accent bg-accent/10 font-medium"
                      : "border-line hover:border-accent/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={option.id}
                    checked={reason === option.id}
                    onChange={() => setReason(option.id)}
                    className="accent-accent"
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>
            {reason === "lainnya" ? (
              <label className="grid gap-1.5 text-sm font-medium">
                Catatan
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  required
                  rows={3}
                  className="rounded-xl border border-line bg-background px-3 py-2 font-normal outline-none focus:border-accent focus:ring-4 focus:ring-accent/15"
                />
              </label>
            ) : null}
            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="submit" disabled={!canSave}>
                Simpan
              </Button>
              <Button type="button" variant="secondary" onClick={() => setMode("choose")}>
                Kembali
              </Button>
            </div>
          </form>
        )}

        <Button ref={closeRef} variant="ghost" onClick={onClose}>
          Tutup
        </Button>
      </div>
    </div>
  );
}
