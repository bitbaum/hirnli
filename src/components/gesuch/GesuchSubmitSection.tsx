import { ORG_PROFILE } from '@/lib/config/org-profile';
import { APPLICATION_METHOD_LABELS } from '@/lib/config/foundations/metadata';

export interface SubmissionInfo {
  foundationName: string;
  email?: string;
  applicationUrl?: string;
  applicationMethod?: string;
  deadline?: string | null;
  deadlineText?: string;
  websiteUrl?: string;
}

function daysUntil(dateStr: string): number | null {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function GesuchSubmitSection({ info }: { info: SubmissionInfo }) {
  const methodLabel = info.applicationMethod
    ? APPLICATION_METHOD_LABELS[info.applicationMethod as keyof typeof APPLICATION_METHOD_LABELS] ?? null
    : null;
  const days = info.deadline ? daysUntil(info.deadline) : null;
  const deadlineUrgent = days !== null && days <= 30;

  return (
    <div className="rounded-xl border border-border bg-bg-light p-6 print:hidden">
      <h2 className="mb-4 text-base font-semibold text-grey-dark">Wie einreichen?</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Left: submission method */}
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

        {/* Right: deadline + our contact */}
        <div className="space-y-3">
          {(info.deadlineText || days !== null) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Eingabeschluss</p>
              {info.deadlineText && (
                <p className="mt-1 text-sm text-text">{info.deadlineText}</p>
              )}
              {days !== null && (
                <p className={`mt-0.5 text-sm font-semibold ${deadlineUrgent ? 'text-red-600' : 'text-text-muted'}`}>
                  {days > 0
                    ? `Noch ${days} Tag${days === 1 ? '' : 'e'}`
                    : days === 0
                      ? 'Heute'
                      : `Abgelaufen (vor ${Math.abs(days)} Tag${Math.abs(days) === 1 ? '' : 'en'})`}
                </p>
              )}
            </div>
          )}

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
