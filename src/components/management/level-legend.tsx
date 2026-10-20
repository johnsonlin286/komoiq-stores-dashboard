import type { LevelTone } from "@/types/inventory";

const legend: { tone: LevelTone; label: string; dot: string }[] = [
  { tone: "neutral", label: "Pantau saja", dot: "bg-muted" },
  { tone: "attention", label: "Perlu perhatian", dot: "bg-warning" },
  { tone: "urgent", label: "Paling mendesak", dot: "bg-danger" },
];

export function LevelLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
      {legend.map((item) => (
        <span key={item.tone} className="flex items-center gap-1.5">
          <span className={`size-2 rounded-full ${item.dot}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
