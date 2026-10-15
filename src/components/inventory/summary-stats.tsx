type SummaryStatsProps = {
  freshAtRisk: number;
  slowMoving: number;
  openTasks: number;
  wasteValue: string;
  wasteDetail: string;
};

const cards = [
  {
    key: "fresh",
    label: "Segar berisiko",
    detail: "belum tertangani",
    accent: "bg-danger",
  },
  {
    key: "slow",
    label: "Tidak laku",
    detail: "di luar barang segar",
    accent: "bg-slow",
  },
  {
    key: "tasks",
    label: "Tugas hari ini",
    detail: "menunggu konfirmasi",
    accent: "bg-accent",
  },
  {
    key: "waste",
    label: "Terbuang bulan ini",
    detail: "",
    accent: "bg-foreground",
  },
] as const;

export function SummaryStats({
  freshAtRisk,
  slowMoving,
  openTasks,
  wasteValue,
  wasteDetail,
}: SummaryStatsProps) {
  const values: Record<(typeof cards)[number]["key"], string> = {
    fresh: String(freshAtRisk),
    slow: String(slowMoving),
    tasks: String(openTasks),
    waste: wasteValue,
  };
  const details: Record<(typeof cards)[number]["key"], string> = {
    fresh: cards[0].detail,
    slow: cards[1].detail,
    tasks: cards[2].detail,
    waste: wasteDetail,
  };

  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.key}
          className="overflow-hidden rounded-2xl bg-panel shadow-[0_1px_2px_rgb(19_41_75/0.04),0_10px_28px_rgb(19_41_75/0.05)] ring-1 ring-line"
        >
          <div className={`h-1 ${card.accent}`} />
          <div className="px-4 py-4 md:px-5">
            <p className="text-sm font-medium text-muted">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums md:text-4xl">
              {values[card.key]}
            </p>
            <p className="mt-1 min-h-8 text-xs leading-4 text-muted">{details[card.key]}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
