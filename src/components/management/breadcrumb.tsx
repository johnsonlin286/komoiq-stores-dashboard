import { ChevronRightIcon, HomeIcon } from "@/components/management/icons";

export type BreadcrumbItem = {
  label: string;
  onSelect?: () => void;
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-muted">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 ? <ChevronRightIcon className="size-3.5 text-line" /> : <HomeIcon />}
          {item.onSelect ? (
            <button
              type="button"
              onClick={item.onSelect}
              className="rounded-md px-1.5 py-0.5 font-medium text-management transition hover:bg-management/10"
            >
              {item.label}
            </button>
          ) : (
            <span className="px-1.5 py-0.5 font-medium text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
