import Card from '@/components/ui/Card';

interface ChartCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

/**
 * The card a @bitbaum/chartkit chart sits in. ChartKit draws on the server and
 * sizes itself, so there is no client mount to wait for and no fixed-height box.
 */
export default function ChartCard({ children, title, className = '' }: ChartCardProps) {
  return (
    <Card padding={false} className={`p-4 ${className}`}>
      {title && <h2 className="mb-3 heading-detail">{title}</h2>}
      {children}
    </Card>
  );
}
