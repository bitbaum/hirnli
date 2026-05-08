import Badge from '@/components/ui/Badge';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  variant?: 'default' | 'hero';
  heroGradient?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, badge, variant = 'default', heroGradient = 'gradient-hero-transparency', children }: PageHeaderProps) {
  if (variant === 'hero') {
    return (
      <div className={`${heroGradient} mb-8 rounded-2xl p-8 text-white`}>
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">{title}</h1>
        {subtitle && <p className="text-lg opacity-90">{subtitle}</p>}
        {children}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <h1 className="heading-section md:text-3xl">{title}</h1>
        {badge && (
          <Badge variant="primary" className="px-3 py-1">{badge}</Badge>
        )}
      </div>
      {subtitle && <p className="mt-2 text-text-light">{subtitle}</p>}
    </div>
  );
}
