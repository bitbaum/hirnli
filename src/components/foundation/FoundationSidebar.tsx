import Link from 'next/link';
import Card from '@/components/ui/Card';
import type { Foundation } from '@/lib/schemas/foundation';
import { SOURCES, FIT_CONFIG } from '@/lib/config/foundations';
import { computeCompleteness } from '@/lib/domain/foundation-research-stats';
import { hasGesuchPage } from '@/lib/domain/foundation-helpers';
import AddToPipelineButton from './AddToPipelineButton';

interface FoundationSidebarProps {
  foundation: Foundation;
}

export default function FoundationSidebar({ foundation: f }: FoundationSidebarProps) {
  const source = SOURCES[f.source];
  const { percent, missing } = computeCompleteness(f);
  const gesuchReady = hasGesuchPage(f);

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
          {f.capital && (
            <div>
              <dt className="text-text-muted">Vermögen</dt>
              <dd className="font-medium text-grey-dark">{f.capital}</dd>
            </div>
          )}
          {f.annualBudget && (
            <div>
              <dt className="text-text-muted">Jahresbudget</dt>
              <dd className="font-medium text-grey-dark">{f.annualBudget}</dd>
            </div>
          )}
          {f.grantExpenditure && (
            <div>
              <dt className="text-text-muted">Förderausgaben</dt>
              <dd className="font-medium text-grey-dark">{f.grantExpenditure}</dd>
            </div>
          )}
          <div>
            <dt className="text-text-muted">Bewerbungsweg</dt>
            <dd className="font-medium text-grey-dark capitalize">{f.applicationMethod}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Fit-Score</dt>
            <dd className="font-medium text-grey-dark">
              {FIT_CONFIG[f.fit as keyof typeof FIT_CONFIG]?.stars ?? '☆☆☆'} ({f.fit}/3)
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

      {/* Gesuch — only show links when a gesuch page actually exists */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Gesuch</h3>
        {gesuchReady ? (
          <div className="space-y-2">
            <AddToPipelineButton foundationId={f.slug} foundationName={f.name} />
            <Link
              href={`/fundraising/stiftungen/${f.slug}/gesuch`}
              className="block rounded-lg bg-primary/10 px-4 py-3 text-center text-sm font-semibold text-primary hover:bg-primary/20"
            >
              Interaktive Seite
            </Link>
            <a
              href={`/api/pdf/gesuch/${f.slug}`}
              download
              className="block rounded-lg border border-border px-4 py-3 text-center text-sm font-medium text-grey-dark hover:bg-bg-light"
            >
              Formelles Dokument (PDF)
            </a>
            <Link
              href={`/fundraising/stiftungen/${f.slug}/gesuch/dokument`}
              className="block text-center text-xs text-text-muted hover:text-primary hover:underline"
            >
              HTML-Vorschau
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <AddToPipelineButton foundationId={f.slug} foundationName={f.name} />
            <p className="text-xs text-text-muted">
              {f.needsResearch
                ? 'Gesuch-Generierung benötigt weitere Recherche.'
                : 'Gesuch nicht verfügbar für diese Prioritätsstufe.'}
            </p>
          </div>
        )}
      </Card>

      {/* Source Links */}
      {f.sourceLinks && f.sourceLinks.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Quellen</h3>
          <div className="space-y-2 text-sm">
            {f.sourceLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-primary hover:underline"
              >
                🔗 {link.label || SOURCES[link.source]?.label || link.source}
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Contact */}
      {f.contact && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Kontakt</h3>
          <div className="space-y-1 text-sm text-text-light">
            {f.contact.address && <p>{f.contact.address}</p>}
            {f.contact.email && (
              <p>
                <a href={`mailto:${f.contact.email}`} className="text-primary">
                  {f.contact.email}
                </a>
              </p>
            )}
            {f.contact.phone && (
              <p>{f.contact.phone}</p>
            )}
          </div>
        </Card>
      )}

      {/* Data Completeness */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Datenvollständigkeit</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 flex-1 rounded-full bg-bg-light">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-text-muted">{percent}%</span>
          </div>
          {missing.length > 0 && (
            <p className="text-xs text-text-muted">
              Fehlend: {missing.join(', ')}
            </p>
          )}
        </div>
      </Card>

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
