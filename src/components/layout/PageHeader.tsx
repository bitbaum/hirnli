interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export default function PageHeader({ title, subtitle, badge }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-grey-dark md:text-3xl">{title}</h1>
        {badge && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-2 text-text-light">{subtitle}</p>}
    </div>
  );
}
