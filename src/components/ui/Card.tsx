type CardVariant = 'default' | 'muted';

const BASE: Record<CardVariant, string> = {
  default: 'rounded-lg border border-border bg-white shadow-sm',
  muted: 'rounded-xl border border-border bg-bg-light',
};

interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  id?: string;
}

export default function Card({ variant = 'default', children, className = '', padding = true, id }: CardProps) {
  return (
    <div id={id} className={`${BASE[variant]} ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`heading-card ${className}`}>{children}</h3>;
}
