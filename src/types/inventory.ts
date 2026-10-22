export type LevelId =
  | "fresh-1"
  | "fresh-2"
  | "fresh-3"
  | "other-2w"
  | "other-1m"
  | "other-3m"
  | "other-6m";

export type LevelTone = "attention" | "urgent" | "neutral";

// Langkah 3: "Lambat laku" (still selling, just too slow) vs "Tidak laku"
// (not selling at all) — Ranch's own split, independent of the day-ladder
// level. Chip color: slow = yellow, dead = red. Stored per task (like the
// suggestion columns) rather than derived on our side — the brief is
// explicit that this classification is backend logic, we just display it.
export type TaskStatus = "slow" | "dead";

export type ReasonCode =
  | "stok-habis"
  | "tujuan-menolak"
  | "tanpa-transport"
  | "van-penuh"
  | "lainnya";

export type StoreTask = {
  id: string;
  productName: string;
  sku: string;
  levelId: LevelId;
  status: TaskStatus;
  valueLabel: string;
  detail: string;
  actionLabel: string;
  quantityLabel: string;
  fromLabel: string;
  toLabel: string | null;
  // Present for "Best today" price-markdown tasks (Langkah 2). Only the
  // price code is stored on the task — the discount percent for that code
  // is looked up live from Settings' bestToday tiers, so editing a tier in
  // Settings updates every task that references that code.
  discount?: {
    code: string;
  };
  // Present for "move to another store" tasks (Langkah 6). `method` isn't
  // stored — it's derived live from `distanceKm` against Settings' transfer
  // thresholds (quickHopKm/vanRunKm), same pattern as the discount percent.
  transfer?: {
    distanceKm: number;
    worthLabel: string;
  };
};

export type Confirmation = {
  taskId: string;
  userName: string;
  at: string;
  done: boolean;
  reason: ReasonCode | null;
  note: string | null;
};

export type WarningSettings = {
  freshDays: number[];
  otherDays: number[];
};

export type LevelDefinition = {
  id: LevelId;
  kind: "fresh" | "other";
  days: number;
  // Message key under Levels.span (see src/hooks/use-level-text.ts) rather
  // than literal text, so the label follows the signed-in locale.
  spanKey: string;
  tone: LevelTone;
};

export const reasonCodes: ReasonCode[] = [
  "stok-habis",
  "tujuan-menolak",
  "tanpa-transport",
  "van-penuh",
  "lainnya",
];

// Pass a translator already scoped to the Reasons namespace, e.g.
// `useTranslations("Reasons")` — "lainnya" with a note uses the manager's
// own text instead of the generic "Other" label.
export function reasonLabel(
  tReasons: (reason: ReasonCode) => string,
  reason: ReasonCode,
  note: string | null,
) {
  if (reason === "lainnya" && note) return note;
  return tReasons(reason);
}

export function reasonsForTask(task: StoreTask): ReasonCode[] {
  const label = task.actionLabel;
  const movesToStore = label.startsWith("Pindah ke ");
  const isReturn = label.startsWith("Retur");

  return reasonCodes.filter((code) => {
    // Langkah 6: moving stock between stores gets its own, more specific
    // reasons (van penuh) instead of the generic "no transport" one, which
    // stays for supplier returns.
    if (code === "tujuan-menolak") return movesToStore;
    if (code === "van-penuh") return movesToStore;
    if (code === "tanpa-transport") return isReturn;
    return true;
  });
}
