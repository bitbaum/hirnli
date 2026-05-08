const VARIANTS = {
  default: 'bg-grey-light text-grey-dark',
  primary: 'bg-primary/10 text-primary-text',
  success: 'bg-success-bg text-success-text',
  warning: 'bg-warning-bg text-warning-text',
  danger: 'bg-danger-bg text-danger-text',
  info: 'bg-primary/10 text-primary-text',
  outline: 'border border-border bg-transparent text-text-muted',
  // Data source badges
  live: 'bg-success-bg text-success-text',
  derived: 'bg-primary/10 text-primary-text',
  estimated: 'bg-warning-bg text-warning-text',
  none: 'bg-grey-light text-text-muted',
  // No color applied — pass full color classes via className
  raw: '',
} as const;

const COLORS = {
  blue: 'bg-primary/10 text-primary-text',
  green: 'bg-success-bg text-success-text',
  emerald: 'bg-success-bg text-success-text',
  purple: 'bg-pillar-vision/15 text-pillar-vision',
  orange: 'bg-warning-bg text-warning-text',
  pink: 'bg-danger-bg/70 text-danger-text',
  teal: 'bg-theme-arbeit/15 text-theme-arbeit',
  gray: 'bg-bg-light text-grey-dark',
  indigo: 'bg-pillar-digital/15 text-pillar-digital',
  yellow: 'bg-warning-bg text-warning-text',
  red: 'bg-danger-bg text-danger-text',
  cyan: 'bg-theme-arbeit/10 text-theme-arbeit',
} as const;

// sm = px-1.5 py-0.5 · md = px-2.5 py-0.5 (default)
const SIZES = {
  sm: 'px-1.5 py-0.5',
  md: 'px-2.5 py-0.5',
} as const;

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  color?: keyof typeof COLORS;
  size?: keyof typeof SIZES;
  className?: string;
}

export default function Badge({ children, variant = 'default', color, size = 'md', className = '' }: BadgeProps) {
  const colorClass = color ? COLORS[color] : VARIANTS[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full ${SIZES[size]} text-xs font-medium ${colorClass} ${className}`}
    >
      {children}
    </span>
  );
}
