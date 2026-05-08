import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  size?: 'sm' | 'md' | 'lg';
}

export default function EmptyState({ title, description, action, size = 'md' }: EmptyStateProps) {
  const py = size === 'lg' ? 'py-20' : size === 'sm' ? 'py-8' : 'py-16';
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-bg-light ${py} text-center`}>
      <p className="mb-1 heading-card">{title}</p>
      {description && (
        <p className="mb-6 max-w-xs text-sm text-text-muted">{description}</p>
      )}
      {action && (
        <Button href={action.href} size="lg">{action.label}</Button>
      )}
    </div>
  );
}
