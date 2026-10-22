import type { ManagementData, ResolvedProductKey, StoreSummary } from "@/types/management";

export { formatRupiah, parseRupiah, sumRupiahLabels } from "@/lib/rupiah";
import { parseRupiah, formatRupiah } from "@/lib/rupiah";

export function rankStores(stores: StoreSummary[]) {
  return [...stores].sort((a, b) => a.wastePercent - b.wastePercent);
}

export function formatPercent(value: number) {
  return `${value.toFixed(1).replace(".", ",")}%`;
}

// Simulates Layar A and Layar B being connected: removes the products a
// manager has confirmed "sudah dikerjakan" on /store-admin from Layar B's
// view, and recomputes the level tiles and store totals that depend on
// them. Resolving nothing (resolved.length === 0) returns the original
// data untouched, so "Restore All" on Layar A reverts Layar B too.
export function applyResolvedProducts(
  data: ManagementData,
  resolved: ResolvedProductKey[],
): ManagementData {
  if (resolved.length === 0) return data;

  const resolvedKeys = new Set(resolved.map((item) => `${item.storeId}:${item.sku}:${item.levelId}`));
  const isResolved = (product: { storeId: string; sku: string; levelId: string }) =>
    resolvedKeys.has(`${product.storeId}:${product.sku}:${product.levelId}`);

  const resolvedRows = data.products.filter(isResolved);
  const products = data.products.filter((product) => !isResolved(product));

  const levelTiles = data.levelTiles.map((tile) => {
    const removed = resolvedRows.filter(
      (row) => row.storeId === tile.storeId && row.levelId === tile.levelId,
    );
    if (removed.length === 0) return tile;

    const removedValue = removed.reduce((sum, row) => sum + parseRupiah(row.valueLabel), 0);
    return {
      ...tile,
      productCount: Math.max(0, tile.productCount - removed.length),
      valueLabel: formatRupiah(Math.max(0, parseRupiah(tile.valueLabel) - removedValue)),
    };
  });

  const stores = data.stores.map((store) => {
    const value = levelTiles
      .filter((tile) => tile.storeId === store.id)
      .reduce((sum, tile) => sum + parseRupiah(tile.valueLabel), 0);
    return { ...store, slowStockValueLabel: formatRupiah(value) };
  });

  return { stores, levelTiles, products };
}
