import Badge from '@/components/ui/Badge';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  /** @deprecated Use default variant — colored hero sections removed for design consistency */
  variant?: 'default' | 'hero';
  /** @deprecated Unused — hero variant deprecated */
  heroGradient?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, badge, children }: PageHeaderProps) {
  return (
    <div className="mb-8 border-b border-border-default-subtle pb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="heading-section md:text-3xl">{title}</h1>
            {badge && (
              <Badge variant="primary">{badge}</Badge>
            )}
          </div>
          {subtitle && <p className="mt-2 text-text-secondary max-w-2xl">{subtitle}</p>}
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    </div>
  );
}
