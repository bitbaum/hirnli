const VARIANTS = {
  default: 'bg-grey-light text-grey-dark',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  // Data source badges
  live: 'bg-success-bg text-success',
  derived: 'bg-primary/10 text-primary',
  estimated: 'bg-warning-bg text-warning',
  none: 'bg-grey-light text-text-muted',
} as const;

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
