type PageContentProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function PageContent({
  title,
  description,
  actions,
  children,
}: PageContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
