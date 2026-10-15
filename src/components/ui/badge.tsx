import type { ReactNode } from "react";

const tones = {
  baru: "bg-[#f3e6cf] text-[#7a5412]",
  diproses: "bg-[#e4eef8] text-[#1d4f82]",
  dikirim: "bg-[#e5f4ef] text-[#0f6e56]",
  selesai: "bg-[#eceae4] text-[#5c564e]",
  buka: "bg-[#e5f4ef] text-[#0f6e56]",
  tutup: "bg-[#eceae4] text-[#5c564e]",
  admin: "bg-white/10 text-white",
};

type BadgeProps = {
  tone: keyof typeof tones;
  children: ReactNode;
};

export function Badge({ tone, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
