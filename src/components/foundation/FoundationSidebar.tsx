import Card from '@/components/ui/Card';
import type { Foundation } from '@/lib/schemas/foundation';
import { SOURCES } from '@/lib/config/foundations';

interface FoundationSidebarProps {
  foundation: Foundation;
}

export default function FoundationSidebar({ foundation: f }: FoundationSidebarProps) {
  const source = SOURCES[f.source];

  return (
    <div className="space-y-4">
      {/* Key Facts */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Auf einen Blick</h3>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-text-muted">Förderbetrag</dt>
            <dd className="font-medium text-grey-dark">{f.amount.text}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Bewerbungsfrist</dt>
            <dd className="font-medium text-grey-dark">{f.deadlineText}</dd>
          </div>
          {f.annualBudget && (
            <div>
              <dt className="text-text-muted">Jahresbudget</dt>
              <dd className="font-medium text-grey-dark">{f.annualBudget}</dd>
            </div>
          )}
          <div>
            <dt className="text-text-muted">Bewerbungsweg</dt>
            <dd className="font-medium text-grey-dark capitalize">{f.applicationMethod}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Fit-Score</dt>
            <dd className="font-medium text-grey-dark">
              {'★'.repeat(f.fit)}{'☆'.repeat(3 - f.fit)} ({f.fit}/3)
            </dd>
          </div>
        </dl>
      </Card>

      {/* Links */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Links</h3>
        <div className="space-y-2 text-sm">
          <a
            href={f.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-primary hover:underline"
          >
            🌐 Website
          </a>
          {f.applicationUrl && (
            <a
              href={f.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-semibold text-primary hover:underline"
            >
              📝 Gesuch einreichen
            </a>
          )}
        </div>
      </Card>

      {/* Contact */}
      {(f.contact || f.contactEmail) && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Kontakt</h3>
          <div className="space-y-1 text-sm text-text-light">
            {f.contact?.address && <p>{f.contact.address}</p>}
            {(f.contact?.email || f.contactEmail) && (
              <p>
                <a href={`mailto:${f.contact?.email || f.contactEmail}`} className="text-primary">
                  {f.contact?.email || f.contactEmail}
                </a>
              </p>
            )}
            {(f.contact?.phone || f.contactPhone) && (
              <p>{f.contact?.phone || f.contactPhone}</p>
            )}
          </div>
        </Card>
      )}

      {/* Research Info */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Recherche</h3>
        <div className="space-y-1 text-sm text-text-light">
          <p>Quelle: {source?.label || f.source}</p>
          <p>Recherchiert: {f.researchDate}</p>
          {f.researchNotes && (
            <p className="mt-2 rounded bg-bg-light p-2 text-xs">{f.researchNotes}</p>
          )}
        </div>
      </Card>
    </div>
  );
}
