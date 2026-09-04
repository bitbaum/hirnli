import Link from 'next/link';
import Card from '@/components/ui/Card';
import type { FoundationRowWithAssessment } from '@/lib/db/schema';
import type { Foundation } from '@/lib/schemas/foundation';
import { UNKNOWN_FIELD } from '@/lib/schemas/foundation';
import { getApplicationUrlContext } from '@/lib/domain/foundation-presenter';

interface ApplicationFoundationCardProps {
  foundation: FoundationRowWithAssessment;
  foundationDetail: Foundation | null | undefined;
}

export default function ApplicationFoundationCard({
  foundation,
  foundationDetail,
}: ApplicationFoundationCardProps) {
  return (
    <Card className="space-y-3">
      <h2 className="heading-item">Stiftung</h2>
      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        {foundationDetail?.applicationUrl &&
          (() => {
            const ctx = getApplicationUrlContext(
              foundationDetail.applicationUrl,
              foundationDetail.applicationMethod,
            );
            const label = !ctx.isEmail
              ? 'Bewerbungsportal'
              : ctx.isPersonalContact
                ? 'Anfrage per E-Mail'
                : 'Bewerbung per E-Mail';
            return (
              <div className="sm:col-span-2">
                <p className="heading-xs-label">{label}</p>
                <a
                  href={foundationDetail.applicationUrl}
                  target={ctx.target}
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {ctx.displayValue}
                </a>
              </div>
            );
          })()}
        {!foundationDetail?.applicationUrl && foundationDetail?.contact?.email && (
          <div className="sm:col-span-2">
            <p className="heading-xs-label">Bewerbung per E-Mail</p>
            <a
              href={`mailto:${foundationDetail.contact.email}`}
              className="text-primary hover:underline"
            >
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
            <a
              href={foundationDetail.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {foundationDetail.websiteUrl}
            </a>
          ) : (
            '—'
          )}
        </div>
        <div>
          <p className="heading-xs-label">Fit Score</p>
          <p className="text-text-primary">
            {foundation.fitScore != null ? `${foundation.fitScore} / 10` : '—'}
          </p>
        </div>
        <div>
          <p className="heading-xs-label">Gesuch</p>
          <Link
            href={`/fundraising/stiftungen/${foundation.id}/gesuch`}
            className="text-primary hover:underline"
          >
            Gesuch öffnen →
          </Link>
        </div>
      </div>
    </Card>
  );
}
