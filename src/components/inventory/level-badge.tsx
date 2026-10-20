import type { LevelDefinition, LevelTone } from "@/types/inventory";

// Satu skala urgensi untuk semua level (segar maupun lainnya): netral (abu,
// pantau saja) → perlu perhatian (kuning/oranye) → paling mendesak (merah).
// Warna tidak lagi dibedakan per jenis barang, supaya "3 bulan" misalnya
// tidak pernah terlihat lebih "aman" daripada "2 minggu" hanya karena warnanya
// kebetulan lebih gelap.
const toneStyles: Record<LevelTone, { pill: string; dot: string }> = {
  neutral: { pill: "bg-skipped-soft text-skipped", dot: "bg-skipped" },
  attention: { pill: "bg-attention-soft text-warning", dot: "bg-warning" },
  urgent: { pill: "bg-danger text-panel", dot: "bg-panel" },
};

export function LevelBadge({ level }: { level: LevelDefinition }) {
  const style = toneStyles[level.tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.pill}`}
    >
      <span className={`size-1.5 rounded-full ${style.dot}`} />
      {level.label}
    </span>
  );
}
