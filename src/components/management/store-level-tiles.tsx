import type { ReactNode } from "react";
import { Breadcrumb } from "@/components/management/breadcrumb";
import { BoxIcon, ChevronRightIcon, LeafIcon } from "@/components/management/icons";
import { LevelLegend } from "@/components/management/level-legend";
import { useResolvedProducts } from "@/hooks/use-resolved-products";
import { getLevels } from "@/lib/levels";
import { HOME_STORE_ID } from "@/lib/linked-tasks";
import { formatPercent, sumRupiahLabels } from "@/lib/management";
import type { LevelId, LevelTone } from "@/types/inventory";
import type { ManagementData } from "@/types/management";

const toneStyle: Record<LevelTone, { border: string; chip: string; chipLabel: string }> = {
  neutral: { border: "border-line", chip: "bg-background text-muted", chipLabel: "Pantau" },
  attention: { border: "border-warning", chip: "bg-warning/10 text-warning", chipLabel: "Perhatian" },
  urgent: { border: "border-danger", chip: "bg-danger/10 text-danger", chipLabel: "Mendesak" },
};

export function StoreLevelTiles({
  data,
  storeId,
  onBack,
  onSelectLevel,
}: {
  data: ManagementData;
  storeId: string;
  onBack: () => void;
  onSelectLevel: (levelId: LevelId) => void;
}) {
  const resolved = useResolvedProducts();
  const store = data.stores.find((item) => item.id === storeId);
  if (!store) return null;

  const tiles = data.levelTiles.filter((tile) => tile.storeId === storeId);
  const freshLevels = getLevels().filter((level) => level.kind === "fresh");
  const otherLevels = getLevels().filter((level) => level.kind === "other");
  const totalFlagged = tiles.reduce((sum, tile) => sum + tile.productCount, 0);
  const totalValue = sumRupiahLabels(tiles.map((tile) => tile.valueLabel));
  const resolvedHere = storeId === HOME_STORE_ID ? resolved.length : 0;

  return (
    <section className="overflow-hidden rounded-3xl bg-panel shadow-[0_1px_2px_rgb(19_41_75/0.04),0_12px_32px_rgb(19_41_75/0.05)] ring-1 ring-line">
      <div className="border-b border-line px-4 py-4 md:px-5">
        <Breadcrumb
          items={[
            { label: "Semua toko", onSelect: onBack },
            { label: store.name.replace("Ranch Market ", "") },
          ]}
        />
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{store.name}</h2>
            <p className="mt-0.5 text-sm text-muted">
              Terbuang {formatPercent(store.wastePercent)} · rak tersedia {store.shelfAvailability}%
            </p>
          </div>
          <p className="rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-muted">
            {totalFlagged} produk bermasalah · {totalValue}
          </p>
        </div>
      </div>

      {resolvedHere > 0 ? (
        <p className="border-b border-line bg-done-soft px-4 py-2.5 text-xs font-medium text-done md:px-5">
          {resolvedHere} tugas sudah dikonfirmasi &ldquo;selesai&rdquo; di Layar A hari ini — sudah
          dikurangi dari daftar di bawah.
        </p>
      ) : null}

      <div className="grid gap-5 px-4 py-5 md:px-5">
        <LevelLegend />
        <TileGroup
          title="Barang segar"
          icon={<LeafIcon className="size-4 text-slow" />}
          levels={freshLevels.map((level) => ({
            level,
            tile: tiles.find((tile) => tile.levelId === level.id),
          }))}
          onSelectLevel={onSelectLevel}
        />
        <TileGroup
          title="Barang lain"
          icon={<BoxIcon className="size-4 text-muted" />}
          levels={otherLevels.map((level) => ({
            level,
            tile: tiles.find((tile) => tile.levelId === level.id),
          }))}
          onSelectLevel={onSelectLevel}
        />
      </div>
    </section>
  );
}

function TileGroup({
  title,
  icon,
  levels,
  onSelectLevel,
}: {
  title: string;
  icon: ReactNode;
  levels: { level: ReturnType<typeof getLevels>[number]; tile: ManagementData["levelTiles"][number] | undefined }[];
  onSelectLevel: (levelId: LevelId) => void;
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
        {icon}
        {title}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {levels.map(({ level, tile }) => {
          const style = toneStyle[level.tone];
          return (
            <button
              key={level.id}
              type="button"
              onClick={() => onSelectLevel(level.id)}
              className={`group flex flex-col rounded-xl border-2 bg-panel px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${style.border}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted">{level.shortLabel}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${style.chip}`}>
                  {style.chipLabel}
                </span>
              </span>
              <span className="mt-1.5 text-2xl font-semibold tabular-nums">{tile?.productCount ?? 0}</span>
              <span className="flex items-center justify-between text-xs text-muted">
                <span>produk</span>
                {tile ? <span>{tile.valueLabel}</span> : null}
              </span>
              <span className="mt-2 flex items-center gap-1 text-xs font-medium text-management opacity-0 transition group-hover:opacity-100">
                Lihat daftar <ChevronRightIcon className="size-3.5" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
