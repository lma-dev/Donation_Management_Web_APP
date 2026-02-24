type PageContentProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  guide?: React.ReactNode;
  children: React.ReactNode;
};

export function PageContent({
  title,
  description,
  actions,
  guide,
  children,
}: PageContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {guide}
          </div>
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
