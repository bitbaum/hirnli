import Link from 'next/link';
import Card from '@/components/ui/Card';
import type { SimilarFoundation } from '@/lib/domain/foundation-recommendations';
import { FIT_CONFIG } from '@/lib/config/foundations';

interface SimilarFoundationsProps {
  similar: SimilarFoundation[];
}

export default function SimilarFoundations({ similar }: SimilarFoundationsProps) {
  if (similar.length === 0) return null;

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
        Ähnliche Stiftungen
      </h3>
      <div className="space-y-3">
        {similar.map(({ foundation: f, reasons }) => (
          <Link
            key={f.slug}
            href={`/fundraising/stiftungen/${f.slug}`}
            className="block rounded-lg border border-border p-3 transition-colors hover:border-primary/30 hover:no-underline"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-grey-dark">{f.name}</span>
              <span className={`text-xs font-bold ${FIT_CONFIG[f.fit as keyof typeof FIT_CONFIG]?.color ?? 'text-text-muted'}`}>
                {FIT_CONFIG[f.fit as keyof typeof FIT_CONFIG]?.stars ?? '☆☆☆'}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {reasons.slice(0, 2).map((reason) => (
                <span key={reason} className="text-[10px] text-text-muted">
                  {reason}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
