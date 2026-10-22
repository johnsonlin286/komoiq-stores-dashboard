import type { WarningSettings } from "@/types/inventory";

// Subcategories brief v3 names for fresh shelf life (Langkah 9). Products
// don't carry a subcategory tag yet (Langkah 8 territory), so these are
// standalone defaults for now rather than wired into per-product logic.
export const freshSubcategories = ["sayur", "buah", "daging", "keju", "roti"] as const;
export type FreshSubcategory = (typeof freshSubcategories)[number];

export type BestTodayTier = {
  code: string;
  percent: number;
};

export type Settings = {
  warnings: WarningSettings & {
    // "Lambat laku: stok lebih dari X hari" — brief leaves this as "diisi
    // Ranch" (no fixed default), so this is a placeholder Ranch will tune.
    slowMovingDays: number;
  };
  shelfLifeDays: Record<FreshSubcategory, number>;
  bestToday: BestTodayTier[];
  tasks: {
    maxPerDay: number;
    checklistItemCount: number;
  };
  transfer: {
    quickHopKm: number;
    vanRunKm: number;
    minValueMultiplier: number;
    maintainMinDisplayAtSender: boolean;
  };
};

export type SettingsAuditEntry = {
  id: string;
  at: string;
  userName: string;
  field: string;
  oldValue: string;
  newValue: string;
};
