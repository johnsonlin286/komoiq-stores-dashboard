"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { readConfirmations, subscribeConfirmations } from "@/lib/confirmation-store";
import { getTaskRef, HOME_STORE_ID } from "@/lib/linked-tasks";
import { reasonLabel, type Confirmation } from "@/types/inventory";
import type { ResolvedProductKey, SkippedProductKey } from "@/types/management";

const EMPTY_CONFIRMATIONS: Confirmation[] = [];

function useLinkedConfirmations(): Confirmation[] {
  return useSyncExternalStore(
    subscribeConfirmations,
    () => readConfirmations(),
    () => EMPTY_CONFIRMATIONS,
  );
}

// Reads the same confirmations Layar A writes (via confirmation-store) and
// resolves them to the Layar B product rows they correspond to. Only "sudah
// dikerjakan" confirmations count — "tidak dikerjakan" means the stock issue
// is still unresolved, so it should keep showing up in Layar B (see
// useSkippedProducts below for surfacing *why* it's still open).
export function useResolvedProducts(): ResolvedProductKey[] {
  const confirmations = useLinkedConfirmations();

  return confirmations
    .filter((confirmation) => confirmation.done)
    .flatMap((confirmation) => {
      const ref = getTaskRef(confirmation.taskId);
      return ref ? [{ storeId: HOME_STORE_ID, sku: ref.sku, levelId: ref.levelId }] : [];
    });
}

// The mirror image of useResolvedProducts: "tidak dikerjakan" confirmations,
// with the manager's reason attached, so Layar B's product table can show
// why a flagged item is still sitting there unresolved.
export function useSkippedProducts(): SkippedProductKey[] {
  const confirmations = useLinkedConfirmations();
  const tReasons = useTranslations("Reasons");

  return confirmations
    .filter((confirmation) => !confirmation.done)
    .flatMap((confirmation) => {
      const ref = getTaskRef(confirmation.taskId);
      if (!ref) return [];
      return [
        {
          storeId: HOME_STORE_ID,
          sku: ref.sku,
          levelId: ref.levelId,
          reasonLabel: reasonLabel(tReasons, confirmation.reason ?? "lainnya", confirmation.note),
        },
      ];
    });
}
