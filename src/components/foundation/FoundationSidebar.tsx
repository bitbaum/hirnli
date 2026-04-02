import Link from 'next/link';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Foundation } from '@/lib/schemas/foundation';
import { SOURCES, FIT_CONFIG } from '@/lib/config/foundations';
import { READINESS_ENGINE } from '@/lib/config/fit-scoring';
import { computeReadinessScore, computePriorityScore } from '@/lib/domain/foundation-scores';
import { hasGesuchPage, tierAtLeast, getTierPromotionSteps, TIER_LABELS, TIER_COLORS, getFitLevel } from '@/lib/domain/foundation-helpers';
import AddToPipelineButton from './AddToPipelineButton';
import { isRegistryUrl } from '@/lib/config/registry-domains';

/** Dimension labels keyed by id for readiness bar display */
const DIM_LABELS: Record<string, string> = {};
for (const dim of READINESS_ENGINE.dimensions) {
  DIM_LABELS[dim.id] = dim.label;
}

interface FoundationSidebarProps {
  foundation: Foundation;
}

export default function FoundationSidebar({ foundation: f }: FoundationSidebarProps) {
  const source = SOURCES[f.source];
  const readiness = computeReadinessScore(f);
  const priority = computePriorityScore(f, readiness.score);
  const gesuchReady = hasGesuchPage(f);
  const tier = readiness.tier;
  const promotion = getTierPromotionSteps(f);

  return (
    <div className="space-y-4">
      {/* Scores Card — Fit, Bereitschaft, Priorität */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Scores</h3>

        {/* Priority */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Priorität</span>
            <span className="text-xs font-bold tabular-nums">
              {priority.label}
              {priority.isOverride && (
                <span className="ml-1 rounded bg-amber-100 px-1 py-0.5 text-xs font-medium text-amber-700">manuell</span>
              )}
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-bg-light" role="progressbar" aria-valuenow={priority.score} aria-valuemin={0} aria-valuemax={100} aria-label={`Priorität: ${priority.score}%`}>
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${priority.score}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-text-muted">{priority.description}</p>
          {priority.components.penaltyReason && (
            <p className="mt-0.5 text-xs text-warning">{priority.components.penaltyReason}</p>
          )}
        </div>

        {/* Readiness */}
        <div className="mb-3 border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Bereitschaft</span>
            <div className="flex items-center gap-1.5">
              <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${TIER_COLORS[tier]}`}>
                {TIER_LABELS[tier]}
              </span>
              <span className="text-xs tabular-nums text-text-muted">{readiness.score}/100</span>
            </div>
          </div>

          {/* Per-dimension bars */}
          <div className="mt-2 space-y-1.5">
            {Object.entries(readiness.dimensions).map(([id, { score, max }]) => (
              <div key={id}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">{DIM_LABELS[id] ?? id}</span>
                  <span className="tabular-nums text-text-muted">{score}/{max}</span>
                </div>
                <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-bg-light" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={max} aria-label={`${DIM_LABELS[id] ?? id}: ${score} von ${max}`}>
                  <div
                    className="h-full rounded-full bg-primary/60 transition-all"
                    style={{ width: `${max > 0 ? (score / max) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top improvements */}
        {promotion.improvements.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {promotion.nextTier ? `Nächste Stufe: ${TIER_LABELS[promotion.nextTier]}` : 'Nächste Verbesserungen'}
            </p>
            <ul className="mt-1 space-y-0.5">
              {promotion.improvements.slice(0, 3).map((imp) => (
                <li key={imp.label} className="flex items-center justify-between text-xs text-text-muted">
                  <span>{imp.label}</span>
                  <span className="tabular-nums text-primary">+{imp.points}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Key Facts */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Auf einen Blick</h3>
        <dl className="space-y-2 text-sm">
          {f.amount.text && f.amount.text !== 'Unbekannt' && (
            <div>
              <dt className="text-text-muted">Förderbetrag</dt>
              <dd className="font-medium text-grey-dark">{f.amount.text}</dd>
            </div>
          )}
          {f.deadlineText && f.deadlineText !== 'Unbekannt' && (
            <div>
              <dt className="text-text-muted">Bewerbungsfrist</dt>
              <dd className="font-medium text-grey-dark">{f.deadlineText}</dd>
            </div>
          )}
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
          {f.applicationMethod && f.applicationMethod !== 'unknown' && (
            <div>
              <dt className="text-text-muted">Bewerbungsweg</dt>
              <dd className="font-medium text-grey-dark capitalize">{f.applicationMethod}</dd>
            </div>
          )}
          <div>
            <dt className="text-text-muted">Fit-Score</dt>
            <dd className="font-medium text-grey-dark">
              {getFitLevel(f) === 0
                ? <span className="text-text-muted">○○○ <span className="sr-only">Fit-Score:</span> Nicht geprüft</span>
                : <><span aria-label={`Fit-Score: ${f.fitScore} von 10, ${getFitLevel(f)} von 3 Sternen`}>{FIT_CONFIG[getFitLevel(f)]?.stars ?? '☆☆☆'}</span> ({f.fitScore}/10)</>
              }
            </dd>
          </div>
        </dl>
      </Card>

      {/* Links — cross-platform references */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Links</h3>
        <div className="space-y-2 text-sm">
          {f.websiteUrl && !isRegistryUrl(f.websiteUrl) ? (
            <a href={f.websiteUrl} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline">
              Website
            </a>
          ) : (
            <span className="block text-text-muted">
              Website —{' '}
              <a href={`https://www.google.com/search?q=${encodeURIComponent(f.name + ' Stiftung Website')}`} target="_blank" rel="noopener noreferrer" className="text-primary/60 hover:text-primary hover:underline">
                suchen
              </a>
            </span>
          )}
          {f.applicationUrl && (
            <a href={f.applicationUrl} target="_blank" rel="noopener noreferrer" className="block font-semibold text-primary hover:underline">
              Gesuch einreichen
            </a>
          )}
          {/* Platform cross-references */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-2 text-xs">
            {f.uid && (
              <a href={`https://www.zefix.ch/de/search/entity/list?mainSearch=${f.uid}`} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary">
                Zefix
              </a>
            )}
            {f.uid && (
              <a href={`https://stiftungen.stiftungschweiz.ch/organisation/${f.slug}`} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary">
                Spheriq
              </a>
            )}
            <a href={`https://www.fundraiso.ch/sponsor/${f.slug}`} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary">
              Fundraiso
            </a>
          </div>
        </div>
      </Card>

      {/* Gesuch */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Gesuch</h3>
        {gesuchReady ? (
          <div className="space-y-4">
            <AddToPipelineButton foundationId={f.slug} foundationName={f.name} />

            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Dokumente</p>
              <Button
                href={`/fundraising/stiftungen/${f.slug}/gesuch`}
                fullWidth
              >
                Gesuch öffnen
              </Button>
              <Button
                href={`/api/pdf/gesuch/${f.slug}`}
                variant="secondary"
                fullWidth
                target="_blank"
              >
                PDF ansehen
              </Button>
              <Link
                href={`/fundraising/stiftungen/${f.slug}/gesuch/dokument`}
                className="block text-center text-xs text-text-muted hover:text-primary hover:underline"
              >
                HTML-Vorschau
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <AddToPipelineButton foundationId={f.slug} foundationName={f.name} />
            <p className="text-xs text-text-muted">
              {!tierAtLeast(tier, 'recherchiert')
                ? 'Gesuch benötigt höhere Bereitschaft (min. Tier Recherchiert).'
                : `Gesuch nur für Priorität 1–3 (aktuell: ${priority.label}).`}
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
                {link.label || SOURCES[link.source]?.label || link.source}
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Contact */}
      {/* Contact — always show all channels, mark missing with search link */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">Kontakt</h3>
        <div className="space-y-2 text-sm">
          {/* Email */}
          {f.contact?.email ? (
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-text-muted">@</span>
              <a href={`mailto:${f.contact.email}`} className="text-primary hover:underline break-all">
                {f.contact.email}
              </a>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-text-muted">
              <span className="mt-0.5">@</span>
              <span>
                E-Mail —{' '}
                <a href={`https://www.google.com/search?q=${encodeURIComponent(f.name + ' Stiftung email Kontakt')}`} target="_blank" rel="noopener noreferrer" className="text-primary/60 hover:text-primary hover:underline">
                  suchen
                </a>
              </span>
            </div>
          )}
          {/* Phone */}
          {f.contact?.phone ? (
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-text-muted">T</span>
              <a href={`tel:${f.contact.phone.replace(/\s/g, '')}`} className="text-grey-dark hover:underline">
                {f.contact.phone}
              </a>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-text-muted">
              <span className="mt-0.5">T</span>
              <span>
                Telefon —{' '}
                <a href={`https://www.google.com/search?q=${encodeURIComponent(f.name + ' Stiftung Telefon')}`} target="_blank" rel="noopener noreferrer" className="text-primary/60 hover:text-primary hover:underline">
                  suchen
                </a>
              </span>
            </div>
          )}
          {/* Address */}
          {f.contact?.address ? (
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-text-muted">A</span>
              <span className="text-grey-dark">{f.contact.address}</span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-text-muted">
              <span className="mt-0.5">A</span>
              <span>
                Adresse —{' '}
                <a href={`https://www.google.com/search?q=${encodeURIComponent(f.name + ' Stiftung Adresse')}`} target="_blank" rel="noopener noreferrer" className="text-primary/60 hover:text-primary hover:underline">
                  suchen
                </a>
              </span>
            </div>
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
