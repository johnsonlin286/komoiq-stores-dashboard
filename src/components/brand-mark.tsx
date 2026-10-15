type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <span
      className={`inline-grid size-9 place-items-center rounded-lg bg-accent text-sm font-semibold text-accent-foreground ${className}`}
    >
      K
    </span>
  );
}
