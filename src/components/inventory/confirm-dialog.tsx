"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useLevelText } from "@/hooks/use-level-text";
import { useSettings } from "@/hooks/use-settings";
import { getLevel } from "@/lib/levels";
import { findBestTodayPercent } from "@/lib/settings-store";
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
  const t = useTranslations("ConfirmDialog");
  const tReasons = useTranslations("Reasons");
  const { statusLabel } = useLevelText();
  const settings = useSettings();
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

  const level = getLevel(task.levelId, settings.warnings);
  const noteMissing = reason === "lainnya" && note.trim().length === 0;
  const canSave = reason !== "" && !noteMissing;
  const movement = task.toLabel
    ? t("fromTo", { quantity: task.quantityLabel, from: task.fromLabel, to: task.toLabel })
    : t("atStore", { quantity: task.quantityLabel, from: task.fromLabel });
  const discountPercent = task.discount
    ? findBestTodayPercent(settings, task.discount.code)
    : undefined;
  // Langkah 6: method isn't stored on the task — it's derived live from the
  // distance against Settings' quick-hop/van-run limits, so retuning those
  // numbers immediately reclassifies every transfer task.
  const transferMethod = task.transfer
    ? task.transfer.distanceKm <= settings.transfer.quickHopKm
      ? "quickHop"
      : task.transfer.distanceKm <= settings.transfer.vanRunKm
        ? "vanRun"
        : "tooFar"
    : undefined;

  return (
    <div className="fixed inset-0 z-40 grid place-items-end bg-[#13294b]/55 p-4 backdrop-blur-[2px] sm:place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="grid max-h-[90dvh] w-full max-w-lg gap-5 overflow-y-auto rounded-3xl bg-panel p-5 shadow-2xl ring-1 ring-line md:p-6"
      >
        <div className="grid gap-3">
          <p className="text-sm font-semibold text-accent">{statusLabel(task.status, level)}</p>
          {discountPercent !== undefined ? (
            <h2 id={titleId} className="text-2xl font-semibold tracking-tight">
              {t("bestTodayQuestion", { product: task.productName, percent: discountPercent })}
            </h2>
          ) : transferMethod && task.toLabel ? (
            <h2 id={titleId} className="text-2xl font-semibold tracking-tight">
              {t("transferQuestion", { quantity: task.quantityLabel, store: task.toLabel })}
            </h2>
          ) : (
            <>
              <h2 id={titleId} className="text-2xl font-semibold tracking-tight">
                {task.productName}
              </h2>
              <p className="text-sm text-muted">{task.detail}</p>
            </>
          )}
          <div className="rounded-2xl bg-background px-4 py-3">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">
              {task.actionLabel}
            </p>
            {discountPercent !== undefined && task.discount ? (
              <p className="mt-1 text-sm font-medium">
                {t("bestTodayCode", { code: task.discount.code })}
              </p>
            ) : transferMethod && task.transfer ? (
              <>
                <p className="mt-1 text-sm font-medium">
                  {task.productName} · {task.quantityLabel}
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  {t("transferMeta", {
                    km: task.transfer.distanceKm,
                    method: t(`transferMethod.${transferMethod}`),
                    worth: task.transfer.worthLabel,
                  })}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm font-medium">{movement}</p>
            )}
          </div>
        </div>

        {mode === "choose" ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <Button onClick={() => onDone(task)}>{t("yesDone")}</Button>
            <Button variant="secondary" onClick={() => setMode("reason")}>
              {t("notDone")}
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
              <legend className="text-sm font-semibold">{t("chooseReason")}</legend>
              {reasonsForTask(task).map((code) => (
                <label
                  key={code}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm ${
                    reason === code
                      ? "border-accent bg-accent/10 font-medium"
                      : "border-line hover:border-accent/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={code}
                    checked={reason === code}
                    onChange={() => setReason(code)}
                    className="accent-accent"
                  />
                  {tReasons(code)}
                </label>
              ))}
            </fieldset>
            {reason === "lainnya" ? (
              <label className="grid gap-1.5 text-sm font-medium">
                {t("note")}
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
                {t("save")}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setMode("choose")}>
                {t("back")}
              </Button>
            </div>
          </form>
        )}

        <Button ref={closeRef} variant="ghost" onClick={onClose}>
          {t("close")}
        </Button>
      </div>
    </div>
  );
}
