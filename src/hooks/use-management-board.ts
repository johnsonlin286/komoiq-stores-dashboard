"use client";

import { useState } from "react";
import type { LevelId } from "@/types/inventory";

export type ManagementStep =
  | { view: "stores" }
  | { view: "store"; storeId: string }
  | { view: "products"; storeId: string; levelId: LevelId };

export function useManagementBoard() {
  const [step, setStep] = useState<ManagementStep>({ view: "stores" });

  function goToStores() {
    setStep({ view: "stores" });
  }

  function goToStore(storeId: string) {
    setStep({ view: "store", storeId });
  }

  function goToProducts(storeId: string, levelId: LevelId) {
    setStep({ view: "products", storeId, levelId });
  }

  return { step, goToStores, goToStore, goToProducts };
}
