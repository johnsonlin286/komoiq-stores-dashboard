type PageHeaderProps = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="grid gap-1">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="max-w-2xl text-sm leading-6 text-muted">{description}</p>
    </header>
  );
}
