export type LevelId =
  | "fresh-1"
  | "fresh-2"
  | "fresh-3"
  | "other-2w"
  | "other-1m"
  | "other-3m"
  | "other-6m";

export type LevelTone = "attention" | "urgent" | "neutral";

export type ReasonCode =
  | "stok-habis"
  | "tujuan-menolak"
  | "tanpa-transport"
  | "lainnya";

export type StoreTask = {
  id: string;
  productName: string;
  sku: string;
  levelId: LevelId;
  detail: string;
  actionLabel: string;
  quantityLabel: string;
  fromLabel: string;
  toLabel: string | null;
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
  label: string;
  shortLabel: string;
  tone: LevelTone;
};

export const reasonOptions: { id: ReasonCode; label: string }[] = [
  { id: "stok-habis", label: "Stok sudah habis" },
  { id: "tujuan-menolak", label: "Toko tujuan menolak" },
  { id: "tanpa-transport", label: "Tidak ada transportasi" },
  { id: "lainnya", label: "Lainnya" },
];

export function reasonLabel(reason: ReasonCode, note: string | null) {
  if (reason === "lainnya" && note) return note;
  return reasonOptions.find((option) => option.id === reason)?.label ?? reason;
}

export function reasonsForTask(task: StoreTask) {
  const label = task.actionLabel;
  const movesToStore = label.startsWith("Pindah ke ") && !label.startsWith("Pindah ke rak");
  const needsTransport = movesToStore || label.startsWith("Retur");

  return reasonOptions.filter((option) => {
    if (option.id === "tujuan-menolak") return movesToStore;
    if (option.id === "tanpa-transport") return needsTransport;
    return true;
  });
}
