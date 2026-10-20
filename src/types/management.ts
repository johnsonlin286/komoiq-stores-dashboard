import type { LevelId } from "@/types/inventory";

export type StoreSummary = {
  id: string;
  name: string;
  wastePercent: number;
  shelfAvailability: number;
  slowStockValueLabel: string;
};

export type LevelTile = {
  storeId: string;
  levelId: LevelId;
  productCount: number;
  valueLabel: string;
};

export type ManagementProduct = {
  storeId: string;
  levelId: LevelId;
  sku: string;
  productName: string;
  stock: number;
  valueLabel: string;
  replacement: string;
  nextAction: string;
};

export type ManagementData = {
  stores: StoreSummary[];
  levelTiles: LevelTile[];
  products: ManagementProduct[];
};

// A Layar B product row resolved via a Layar A confirmation (see
// src/hooks/use-resolved-products.ts and src/lib/linked-tasks.ts).
export type ResolvedProductKey = {
  storeId: string;
  sku: string;
  levelId: string;
};

// A Layar B product row whose Layar A task was marked "tidak dikerjakan" —
// the stock issue is still open, but the manager's reason is worth showing.
export type SkippedProductKey = ResolvedProductKey & {
  reasonLabel: string;
};
