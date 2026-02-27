import { ORG_PROFILE } from '@/lib/config/org-profile';

export interface SubmissionInfo {
  foundationName: string;
  email?: string;
  applicationUrl?: string;
  applicationMethod?: string;
  deadline?: string | null;
  deadlineText?: string;
  websiteUrl?: string;
}

const METHOD_LABELS: Record<string, string> = {
  email: 'Per E-Mail',
  online: 'Online-Formular',
  post: 'Per Post',
  contact: 'Auf Anfrage',
  direct: 'Direkte Kontaktaufnahme',
  personal: 'Persönliches Gespräch',
  partnership: 'Partnerschaft',
  via_partner: 'Über Partner',
  membership: 'Mitgliedschaft',
  contract: 'Vertrag',
  none: 'Keine offenen Bewerbungen',
  unknown: 'Einreichungsweg unbekannt',
};

function daysUntil(dateStr: string): number | null {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function GesuchSubmitSection({ info }: { info: SubmissionInfo }) {
  const methodLabel = info.applicationMethod ? (METHOD_LABELS[info.applicationMethod] ?? info.applicationMethod) : null;
  const days = info.deadline ? daysUntil(info.deadline) : null;
  const deadlineUrgent = days !== null && days <= 30;

  return (
    <div className="rounded-xl border border-border bg-bg-light p-6 print:hidden">
      <h2 className="mb-4 text-base font-semibold text-grey-dark">Wie einreichen?</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Left: Submission method */}
        <div className="space-y-3">
          {methodLabel && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Einreichungsweg</p>
              <p className="mt-1 text-sm text-text">{methodLabel}</p>
            </div>
          )}

          {info.email && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">E-Mail</p>
              <a
                href={`mailto:${info.email}?subject=Fördergesuch ${ORG_PROFILE.name}`}
                className="mt-1 block text-sm text-primary hover:underline"
              >
                {info.email}
              </a>
            </div>
          )}

          {info.applicationUrl && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Online-Formular</p>
              <a
                href={info.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-sm text-primary hover:underline"
              >
                Zum Bewerbungsformular →
              </a>
            </div>
          )}

          {info.websiteUrl && !info.applicationUrl && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Website</p>
              <a
                href={info.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-sm text-primary hover:underline"
              >
                {info.foundationName} →
              </a>
            </div>
          )}
        </div>

        {/* Right: Deadline */}
        <div className="space-y-3">
          {(info.deadline || info.deadlineText) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Eingabeschluss</p>
              {info.deadlineText && (
                <p className="mt-1 text-sm text-text">{info.deadlineText}</p>
              )}
              {days !== null && (
                <p className={`mt-1 text-sm font-semibold ${deadlineUrgent ? 'text-red-600' : 'text-text-muted'}`}>
                  {days > 0
                    ? `Noch ${days} Tag${days === 1 ? '' : 'e'}`
                    : days === 0
                      ? 'Heute'
                      : `Abgelaufen (vor ${Math.abs(days)} Tag${Math.abs(days) === 1 ? '' : 'en'})`}
                </p>
              )}
            </div>
          )}

          {/* Our contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Absender</p>
            <p className="mt-1 text-sm text-text">{ORG_PROFILE.name}</p>
            <a href={`mailto:${ORG_PROFILE.email}`} className="text-sm text-primary hover:underline">
              {ORG_PROFILE.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
