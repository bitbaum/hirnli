import Link from 'next/link';
import Card from '@/components/ui/Card';
import type { SimilarFoundation } from '@/lib/domain/foundation-recommendations';
import { FIT_CONFIG } from '@/lib/config/foundations';
import { getFitLevel } from '@/lib/domain/foundation-helpers';
import { CARD_HEADING_CLASS } from '@/lib/utils/form-classes';

interface SimilarFoundationsProps {
  similar: SimilarFoundation[];
}

export default function SimilarFoundations({ similar }: SimilarFoundationsProps) {
  if (similar.length === 0) return null;

  return (
    <Card>
      <h3 className={CARD_HEADING_CLASS}>Ähnliche Stiftungen</h3>
      <div className="space-y-3">
        {similar.map(({ foundation: f, reasons }) => {
          const fitLevel = getFitLevel(f);
          return (
          <Link
            key={f.slug}
            href={`/fundraising/stiftungen/${f.slug}`}
            className="block rounded-lg border border-border p-3 transition-colors hover:border-primary/30 hover:no-underline"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-grey-dark">{f.name}</span>
              <span className={`text-xs font-bold ${FIT_CONFIG[fitLevel].color}`}>
                {FIT_CONFIG[fitLevel].stars}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {reasons.slice(0, 2).map((reason) => (
                <span key={reason} className="text-sm text-text-muted">
                  {reason}
                </span>
              ))}
            </div>
          </Link>
          );
        })}
      </div>
    </Card>
  );
}
