import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Foundation } from '@/lib/schemas/foundation';
import { UNKNOWN_FIELD } from '@/lib/schemas/foundation';
import { SOURCES, FIT_CONFIG, APPLICATION_METHOD_LABELS } from '@/lib/config/foundations';
import { READINESS_ENGINE } from '@/lib/config/fit-scoring';
import { computeReadinessScore, computePriorityScore } from '@/lib/domain/foundation-scores';
import { hasGesuchPage, tierAtLeast, getTierPromotionSteps, TIER_LABELS } from '@/lib/domain/foundation-helpers';
import { getFoundationPresentation } from '@/lib/domain/foundation-presenter';
import AddToPipelineButton from './AddToPipelineButton';
import { isRegistryUrl } from '@/lib/config/registry-domains';
import { getResearchLinks } from '@/lib/config/research-links';
import { getTrustLevel, TRUST_CONFIG } from '@/lib/config/trust-levels';
import ProgressBar from '@/components/ui/ProgressBar';

/** Dimension labels keyed by id for readiness bar display */
const DIM_LABELS = Object.fromEntries(READINESS_ENGINE.dimensions.map(d => [d.id, d.label]));

interface FoundationSidebarProps {
  foundation: Foundation;
}

export default function FoundationSidebar({ foundation: f }: FoundationSidebarProps) {
  const source = SOURCES[f.source];
  const { tier, tierLabel, tierColor, fitLevel, readinessScore } = getFoundationPresentation(f);
  const readiness = computeReadinessScore(f);
  const priority = computePriorityScore(f, readiness.score);
  const gesuchReady = hasGesuchPage(f);
  const promotion = getTierPromotionSteps(f);

  return (
    <div className="space-y-4">
      {/* Scores Card — Fit, Bereitschaft, Priorität */}
      <Card>
        <h3 className="heading-label mb-3">Scores</h3>

        {/* Priority */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Priorität</span>
            <span className="text-xs font-bold tabular-nums">
              {priority.label}
              {priority.isOverride && (
                <span className="ml-1 rounded bg-warning/10 px-1 py-0.5 text-xs font-medium text-warning">manuell</span>
              )}
            </span>
          </div>
          <ProgressBar percent={priority.score} size="sm" color="bg-primary" label={`Priorität: ${priority.score}%`} />
          <p className="mt-1 text-sm text-text-muted">{priority.description}</p>
          {priority.components.penaltyReason && (
            <p className="mt-0.5 text-sm text-warning">{priority.components.penaltyReason}</p>
          )}
        </div>

        {/* Readiness */}
        <div className="mb-3 border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">Bereitschaft</span>
            <div className="flex items-center gap-1.5">
              <Badge variant="raw" size="sm" className={tierColor}>
                {TIER_LABELS[tier]}
              </Badge>
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
                <ProgressBar percent={max > 0 ? (score / max) * 100 : 0} size="xs" color="bg-primary/60" label={`${DIM_LABELS[id] ?? id}: ${score} von ${max}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Top improvements */}
        {promotion.improvements.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="heading-xs-label">
              {promotion.nextTier ? `Nächste Stufe: ${TIER_LABELS[promotion.nextTier]}` : 'Nächste Verbesserungen'}
            </p>
            <ul className="mt-1 space-y-0.5">
              {promotion.improvements.slice(0, 3).map((imp) => (
                <li key={imp.label} className="flex items-center justify-between text-sm text-text-muted">
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
        <h3 className="heading-label mb-3">Auf einen Blick</h3>
        <dl className="space-y-2 text-sm">
          {f.amount.text && f.amount.text !== UNKNOWN_FIELD && (
            <div>
              <dt className="text-text-muted">Förderbetrag</dt>
              <dd className="font-medium text-grey-dark">{f.amount.text}</dd>
            </div>
          )}
          {f.deadlineText && f.deadlineText !== UNKNOWN_FIELD && (
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
            APPLICATION_METHOD_LABELS[f.applicationMethod] !== null && (
              <div>
                <dt className="text-text-muted">Bewerbungsweg</dt>
                <dd className="font-medium text-grey-dark">
                  {APPLICATION_METHOD_LABELS[f.applicationMethod]}
                </dd>
              </div>
            )
          )}
          <div>
            <dt className="text-text-muted">Fit-Score</dt>
            <dd className="font-medium text-grey-dark">
              {fitLevel === 0
                ? <span className="text-text-muted">○○○ <span className="sr-only">Fit-Score:</span> Nicht geprüft</span>
                : <><span aria-label={`Fit-Score: ${f.fitScore} von 10, ${fitLevel} von 3 Sternen`}>{FIT_CONFIG[fitLevel].stars}</span> ({f.fitScore}/10)</>
              }
            </dd>
          </div>
        </dl>
      </Card>

      {/* Research Links — cross-platform references for verification */}
      <Card>
        <h3 className="heading-label mb-3">Recherche-Links</h3>
        <div className="space-y-1.5 text-sm">
          {/* Foundation website (if verified) */}
          {f.websiteUrl && !isRegistryUrl(f.websiteUrl) ? (
            <a href={f.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-between rounded px-2 py-2.5 text-primary hover:bg-bg-light hover:underline">
              <span className="font-medium">Website</span>
              <span className="text-xs text-text-muted">↗</span>
            </a>
          ) : (
            <div className="flex items-center justify-between rounded px-2 py-1.5 text-text-muted">
              <span>Website</span>
              <span className="text-sm italic">nicht bekannt</span>
            </div>
          )}
          {f.applicationUrl && (
            <a href={f.applicationUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-between rounded bg-primary/5 px-2 py-2.5 font-semibold text-primary hover:bg-primary/10 hover:underline">
              <span>Gesuch einreichen</span>
              <span className="text-xs">↗</span>
            </a>
          )}
          {/* All research platforms */}
          <div className="border-t border-border pt-2">
            <p className="mb-1.5 px-2 text-sm font-medium text-text-muted">Datenbanken & Register</p>
            {getResearchLinks(f).map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center justify-between rounded px-2 py-2.5 text-text-muted hover:bg-bg-light hover:text-primary"
              >
                <span className="flex items-center gap-1.5">
                  {link.official && <span className="text-xs text-primary/60" title="Offizielles Register">●</span>}
                  <span>{link.label}</span>
                </span>
                <span className="text-xs">↗</span>
              </a>
            ))}
          </div>
        </div>
      </Card>

      {/* Gesuch */}
      <Card>
        <h3 className="heading-label mb-3">Gesuch</h3>
        {gesuchReady ? (
          <div className="space-y-4">
            <AddToPipelineButton foundationId={f.slug} foundationName={f.name} />

            <div className="space-y-2 border-t border-border pt-3">
              <p className="heading-xs-label">Dokumente</p>
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
                className="block text-center text-sm text-text-muted hover:text-primary hover:underline"
              >
                HTML-Vorschau
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <AddToPipelineButton foundationId={f.slug} foundationName={f.name} />
            <p className="text-sm text-text-muted">
              {!tierAtLeast(tier, 'recherchiert')
                ? 'Gesuch benötigt höhere Bereitschaft (min. Tier Recherchiert).'
                : `Gesuch nur für Priorität 1–3 (aktuell: ${priority.label}).`}
            </p>
          </div>
        )}
      </Card>

      {/* Source Links — additional references beyond standard platforms */}
      {f.sourceLinks && f.sourceLinks.length > 0 && (
        <Card>
          <h3 className="heading-label mb-3">Weitere Quellen</h3>
          <div className="space-y-1.5 text-sm">
            {f.sourceLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center justify-between rounded px-2 py-2.5 text-text-muted hover:bg-bg-light hover:text-primary"
              >
                <span>{link.label || SOURCES[link.source]?.label || link.source}</span>
                <span className="text-xs">↗</span>
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Contact */}
      {/* Contact — always show all channels, mark missing with search link */}
      <Card>
        <h3 className="heading-label mb-3">Kontakt</h3>
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

      {/* Research Info + Trust Level */}
      <Card>
        <h3 className="heading-label mb-3">Recherche</h3>
        <div className="space-y-2 text-sm">
          {(() => {
            const trust = getTrustLevel(f);
            const trustDisplay = TRUST_CONFIG[trust];
            return (
              <div className={`flex items-center gap-2 rounded px-2 py-1.5 ${trustDisplay.badgeClass}`}>
                <span>●</span>
                <div>
                  <p className="font-semibold">{trustDisplay.label}</p>
                  <p className="text-sm opacity-80">{trustDisplay.description}</p>
                </div>
              </div>
            );
          })()}
          <div className="space-y-1 text-text-light">
            <p>Quelle: {source?.label || f.source}</p>
            <p>Tiefe: {f.researchDepth === 'deep' ? 'Tiefenrecherche' : f.researchDepth === 'standard' ? 'Standard' : 'Schnellanalyse'}</p>
            <p>Recherchiert: {f.researchDate}</p>
          </div>
          {f.researchNotes && (
            <p className="rounded bg-bg-light p-2 text-sm text-text-light">{f.researchNotes}</p>
          )}
        </div>
      </Card>
    </div>
  );
}
