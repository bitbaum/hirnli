// ---------------------------------------------------------------------------
// Methodik page shared helper components
// ---------------------------------------------------------------------------

import Badge from '@/components/ui/Badge';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';

export const CONFIDENCE_BADGE_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  high: { label: 'High', variant: 'success' },
  medium: { label: 'Medium', variant: 'warning' },
  estimated: { label: 'Geschätzt', variant: 'warning' },
  target: { label: 'Budget-Ziel', variant: 'default' },
  low: { label: 'Low', variant: 'danger' },
  unknown: { label: 'Unbekannt', variant: 'danger' },
};

export function FormulaBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg border border-primary/20 bg-primary/10 p-4 font-mono text-sm">
      {children}
    </div>
  );
}

export function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { label: 'Konfidenz: Hoch', variant: 'success' as const },
    medium: { label: 'Konfidenz: Mittel', variant: 'warning' as const },
    low: { label: 'Konfidenz: Niedrig', variant: 'danger' as const },
  };
  const { label, variant } = config[level];
  return <Badge variant={variant}>{label}</Badge>;
}

export function MethodologySection({
  id,
  title,
  badgeLabel,
  badgeVariant,
  confidence,
  confidenceNote,
  children,
}: {
  id: string;
  title: string;
  badgeLabel?: string;
  badgeVariant?: 'success' | 'derived' | 'warning' | 'estimated';
  confidence: 'high' | 'medium' | 'low';
  confidenceNote?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {badgeLabel && <Badge variant={badgeVariant}>{badgeLabel}</Badge>}
            <CardTitle>{title}</CardTitle>
          </div>
        </CardHeader>
        {children}
        <div className="mt-6 flex items-center gap-2">
          <ConfidenceBadge level={confidence} />
          {confidenceNote && (
            <span className="text-xs text-text-muted">{confidenceNote}</span>
          )}
        </div>
      </Card>
    </section>
  );
}
