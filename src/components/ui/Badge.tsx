const VARIANTS = {
  default: 'bg-grey-light text-grey-dark',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  info: 'bg-primary/10 text-primary',
  outline: 'border border-border bg-transparent text-text-muted',
  // Data source badges
  live: 'bg-success-bg text-success',
  derived: 'bg-primary/10 text-primary',
  estimated: 'bg-warning-bg text-warning',
  none: 'bg-grey-light text-text-muted',
} as const;

const COLORS: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
  pink: 'bg-pink-100 text-pink-700',
  teal: 'bg-teal-100 text-teal-700',
  gray: 'bg-bg-light text-grey-dark',
  indigo: 'bg-indigo-100 text-indigo-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  cyan: 'bg-cyan-100 text-cyan-700',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  color?: string;
  className?: string;
}

export default function Badge({ children, variant = 'default', color, className = '' }: BadgeProps) {
  const colorClass = color
    ? (COLORS[color] || COLORS.gray)
    : VARIANTS[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass} ${className}`}
    >
      {children}
    </span>
  );
}
