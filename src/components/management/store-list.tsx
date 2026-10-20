import { ChevronRightIcon } from "@/components/management/icons";
import { formatPercent, rankStores } from "@/lib/management";
import type { ManagementData } from "@/types/management";

export function StoreList({
  data,
  onSelectStore,
}: {
  data: ManagementData;
  onSelectStore: (storeId: string) => void;
}) {
  const stores = rankStores(data.stores);

  return (
    <section className="overflow-hidden rounded-3xl bg-panel shadow-[0_1px_2px_rgb(19_41_75/0.04),0_12px_32px_rgb(19_41_75/0.05)] ring-1 ring-line">
      <div className="border-b border-line px-4 py-4 md:px-5">
        <h2 className="text-lg font-semibold">Semua toko</h2>
        <p className="mt-0.5 text-sm text-muted">
          Diurutkan dari persen terbuang terendah. Klik satu toko untuk melihat stok tidak bergerak.
        </p>
      </div>

      <ol className="divide-y divide-line">
        {stores.map((store, index) => {
          const isLast = index === stores.length - 1;
          const wasteTextColor = isLast ? "text-danger" : index === 0 ? "text-done" : "text-warning";

          return (
            <li key={store.id}>
              <button
                type="button"
                onClick={() => onSelectStore(store.id)}
                className="group flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-background md:px-5"
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-panel tabular-nums ${
                    index === 0 ? "bg-done" : isLast ? "bg-danger" : "bg-management"
                  }`}
                >
                  {index + 1}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{store.name}</span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
                    <Stat label="Terbuang" value={formatPercent(store.wastePercent)} valueClassName={wasteTextColor} />
                    <Stat label="Rak tersedia" value={`${store.shelfAvailability}%`} />
                    <Stat label="Stok tidak bergerak" value={store.slowStockValueLabel} />
                  </span>
                </span>

                <ChevronRightIcon className="size-5 shrink-0 text-line transition group-hover:translate-x-0.5 group-hover:text-management" />
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Stat({
  label,
  value,
  valueClassName = "text-foreground",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <span className="whitespace-nowrap">
      <span className="text-muted">{label} </span>
      <span className={`font-semibold tabular-nums ${valueClassName}`}>{value}</span>
    </span>
  );
}
