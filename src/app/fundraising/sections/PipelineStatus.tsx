import Link from 'next/link';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { STATUS_LABELS, STATUS_BADGE_VARIANT } from '@/lib/config/foundations';
import type { FoundationStatus } from '@/lib/schemas/foundation';
import { computePipelineStats } from '../data';

export default function PipelineStatus() {
  const stats = computePipelineStats();

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Fundraising Pipeline</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(Object.entries(stats.statusCounts) as [FoundationStatus, number][]).map(
          ([status, count]) => (
            <Link
              key={status}
              href={`/fundraising/stiftungen?status=${status}`}
              className="block rounded-lg bg-bg-light p-4 text-center transition-shadow hover:shadow-md"
            >
              <Badge variant={STATUS_BADGE_VARIANT[status]} className="mb-2">
                {STATUS_LABELS[status].text}
              </Badge>
              <div className="heading-section">{count}</div>
              <div className="text-sm text-text-muted">{STATUS_LABELS[status].desc}</div>
            </Link>
          )
        )}
      </div>
      <div className="mt-4 text-center">
        <Button href="/fundraising/stiftungen" size="md">
          Stiftungen & Förderer Übersicht <span aria-hidden="true">&rarr;</span>
        </Button>
      </div>
    </Card>
  );
}
