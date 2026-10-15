import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <section className={`rounded-2xl border border-line bg-panel ${className}`}>
      {children}
    </section>
  );
}
