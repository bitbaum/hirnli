import Link from 'next/link';
import Card from '@/components/ui/Card';
import type { FoundationRow } from '@/lib/db/schema';
import type { Foundation } from '@/lib/schemas/foundation';
import { UNKNOWN_FIELD } from '@/lib/schemas/foundation';

interface ApplicationFoundationCardProps {
  foundation: FoundationRow;
  foundationDetail: Foundation | null | undefined;
}

export default function ApplicationFoundationCard({ foundation, foundationDetail }: ApplicationFoundationCardProps) {
  return (
    <Card className="space-y-3">
      <h2 className="heading-item">Stiftung</h2>
      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        {foundationDetail?.applicationUrl && (
          <div className="sm:col-span-2">
            <p className="heading-xs-label">
              {!foundationDetail.applicationUrl.startsWith('mailto:')
                ? 'Bewerbungsportal'
                : ['contact', 'direct', 'personal'].includes(foundationDetail.applicationMethod ?? '')
                  ? 'Anfrage per E-Mail'
                  : 'Bewerbung per E-Mail'}
            </p>
            <a
              href={foundationDetail.applicationUrl}
              target={foundationDetail.applicationUrl.startsWith('mailto:') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {foundationDetail.applicationUrl.startsWith('mailto:')
                ? foundationDetail.applicationUrl.replace('mailto:', '')
                : foundationDetail.applicationUrl}
            </a>
          </div>
        )}
        {!foundationDetail?.applicationUrl && foundationDetail?.contact?.email && (
          <div className="sm:col-span-2">
            <p className="heading-xs-label">Bewerbung per E-Mail</p>
            <a href={`mailto:${foundationDetail.contact.email}`} className="text-primary hover:underline">
              {foundationDetail.contact.email}
            </a>
          </div>
        )}
        {foundationDetail?.deadlineText && foundationDetail.deadlineText !== UNKNOWN_FIELD && (
          <div>
            <p className="heading-xs-label">Eingabeschluss</p>
            <p className="text-text-primary">{foundationDetail.deadlineText}</p>
          </div>
        )}
        <div>
          <p className="heading-xs-label">Website</p>
          {foundationDetail?.websiteUrl ? (
            <a href={foundationDetail.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
              {foundationDetail.websiteUrl}
            </a>
          ) : '—'}
        </div>
        <div>
          <p className="heading-xs-label">Fit Score</p>
          <p className="text-text-primary">{foundation.fitScore != null ? `${foundation.fitScore} / 10` : '—'}</p>
        </div>
        <div>
          <p className="heading-xs-label">Gesuch</p>
          <Link href={`/fundraising/stiftungen/${foundation.id}/gesuch`} className="text-primary hover:underline">
            Gesuch öffnen →
          </Link>
        </div>
      </div>
    </Card>
  );
}
