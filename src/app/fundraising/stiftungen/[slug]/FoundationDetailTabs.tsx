'use client';

import Tabs from '@/components/ui/Tabs';
import Callout from '@/components/ui/Callout';
import FitAnalysis from '@/components/foundation/FitAnalysis';
import ApproachChecklist from '@/components/foundation/ApproachChecklist';
import Card from '@/components/ui/Card';
import type { Foundation } from '@/lib/schemas/foundation';
import { TYPE_LABELS } from '@/lib/config/foundations';
import { getQualityTier, tierAtLeast, TIER_LABELS, isActionablePriority } from '@/lib/domain/foundation-helpers';
import { getFoundationPresentation } from '@/lib/domain/foundation-presenter';
import type { FitNarrative, ThemeAlignment, ApproachStep, ReadinessItem } from '@/lib/domain/foundation-contextualization';
import type { QualityTier } from '@/lib/schemas/foundation';

interface Props {
  foundation: Foundation;
  fitNarrative?: FitNarrative;
  themeAlignments?: ThemeAlignment[];
  approachSteps?: ApproachStep[];
  readiness?: ReadinessItem[];
}

const TIER_BANNER: Record<QualityTier, { text: string; className: string } | null> = {
  anwendungsbereit: null,
  recherchiert: null,
  profiliert: {
    text: 'Automatisch profiliert — basiert auf Registerdaten',
    className: 'border-warning/30 bg-warning/10 text-warning',
  },
  erfasst: {
    text: 'Nur Registerdaten verfügbar — Recherche ausstehend',
    className: 'border-border-default bg-grey-light text-text-muted',
  },
  verzeichnet: {
    text: 'Nur im Verzeichnis erfasst — keine weiteren Daten',
    className: 'border-border-default bg-grey-light text-text-muted',
  },
};

export default function FoundationDetailTabs({ foundation: f, fitNarrative, themeAlignments, approachSteps, readiness }: Props) {
  const typeLabel = TYPE_LABELS[f.type];
  const tier = getQualityTier(f);
  const banner = TIER_BANNER[tier];
  const { trust } = getFoundationPresentation(f);
  const isActionable = isActionablePriority(f);
  const showTrustWarning = trust === 'unverified' && isActionable;

  // verzeichnet/erfasst: only show Details tab (fit + strategy are meaningless)
  // profiliert+: show all tabs
  const tabs = !tierAtLeast(tier, 'profiliert')
    ? [{ id: 'details', label: 'Details', icon: '📄' }]
    : [
        { id: 'fit', label: 'Fit-Analyse', icon: '🎯' },
        { id: 'strategy', label: 'Strategie', icon: '📋' },
        { id: 'details', label: 'Details', icon: '📄' },
      ];

  return (
    <>
      {showTrustWarning && (
        <Callout color="warning" className="mb-4 text-sm font-medium">
          Automatisch eingestuft — Fit-Score und Priorität basieren auf KI-Analyse, nicht auf manueller Recherche. Vor einer Bewerbung bitte über die Recherche-Links verifizieren.
        </Callout>
      )}
      {banner && (
        <div className={`mb-4 rounded-lg border px-4 py-3 text-sm font-medium ${banner.className}`}>
          {banner.text}
          <span className="ml-2 rounded-full bg-surface-raised/50 px-2 py-0.5 text-xs font-bold uppercase">
            {TIER_LABELS[tier]}
          </span>
        </div>
      )}
      <Tabs tabs={tabs}>
        {(activeTab) => {
          switch (activeTab) {
            case 'fit':
              return (
                <FitAnalysis
                  foundation={f}
                  fitNarrative={fitNarrative}
                  themeAlignments={themeAlignments}
                />
              );

          case 'strategy':
            return (
              <div className="space-y-4">
                <Card>
                  <h3 className="mb-4 heading-card">Bewerbungsstrategie</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="heading-detail">Stiftungstyp</h4>
                      <p className="mt-1 text-sm text-text-secondary">
                        <strong>Typ {typeLabel.short}:</strong> {typeLabel.desc}
                      </p>
                    </div>
                    <div>
                      <h4 className="heading-detail">Empfohlener Ansatz</h4>
                      <p className="mt-1 text-sm text-text-secondary">{typeLabel.approach}</p>
                    </div>
                    {f.deadlines && f.deadlines.length > 0 && (
                      <div>
                        <h4 className="heading-detail">Eingabefristen</h4>
                        <table className="mt-2 w-full text-sm">
                          <thead>
                            <tr className="border-b border-border-default">
                              <th scope="col" className="py-2 text-left text-sm font-semibold text-text-muted">Eingabe bis</th>
                              <th scope="col" className="py-2 text-left text-sm font-semibold text-text-muted">Antwort</th>
                            </tr>
                          </thead>
                          <tbody>
                            {f.deadlines.map((d, i) => (
                              <tr key={i} className="border-b border-border-default">
                                <td className="py-2">{d.date}</td>
                                <td className="py-2">{d.response}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {f.responseTime && (
                      <div>
                        <h4 className="heading-detail">Antwortzeit</h4>
                        <p className="mt-1 text-sm text-text-secondary">{f.responseTime}</p>
                      </div>
                    )}
                    {f.decisionCycle && (
                      <div>
                        <h4 className="heading-detail">Entscheidungszyklus</h4>
                        <p className="mt-1 text-sm text-text-secondary">{f.decisionCycle}</p>
                      </div>
                    )}
                    {f.applicationProcess && f.applicationProcess.length > 0 && (
                      <div>
                        <h4 className="heading-detail">Bewerbungsprozess</h4>
                        <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-text-secondary">
                          {f.applicationProcess.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Approach checklist — derived from foundation data */}
                {approachSteps && readiness && (
                  <ApproachChecklist steps={approachSteps} readiness={readiness} />
                )}
              </div>
            );

          case 'details':
            return (
              <Card>
                <h3 className="mb-4 heading-card">Details</h3>
                <div className="space-y-4 text-sm">
                  {f.purposeSummary && (
                    <div>
                      <h4 className="heading-item">Stiftungszweck</h4>
                      <p className="mt-1 text-text-secondary">{f.purposeSummary}</p>
                    </div>
                  )}
                  {f.criteria && (
                    <div>
                      <h4 className="heading-item">Förderkriterien</h4>
                      {f.criteria.nature && <p className="mt-1 text-text-secondary">{f.criteria.nature}</p>}
                      {f.criteria.education && <p className="mt-1 text-text-secondary">{f.criteria.education}</p>}
                    </div>
                  )}
                  {f.sdgs && f.sdgs.length > 0 && (
                    <div>
                      <h4 className="heading-item">SDGs</h4>
                      <div className="mt-1 flex gap-2">
                        {f.sdgs.map((sdg) => (
                          <span key={sdg} className="rounded bg-surface-raised px-2 py-1 text-xs font-medium">
                            SDG {sdg}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {f.boardMembers && f.boardMembers.length > 0 && (
                    <div>
                      <h4 className="heading-item">Stiftungsrat</h4>
                      <div className="mt-2 space-y-1">
                        {f.boardMembers.map((m) => (
                          <div key={m.name} className="flex items-baseline justify-between border-b border-border-default py-1">
                            <span className="text-text">{m.name}</span>
                            <span className="text-sm text-text-muted">{m.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {f.pastGrantees && f.pastGrantees.length > 0 && (
                    <div>
                      <h4 className="heading-item">Bisherige Förderempfänger</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {f.pastGrantees.map((g) => (
                          <span key={g} className="rounded bg-surface-raised px-2 py-1 text-xs">{g}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(f.supervisoryAuthority || (f.memberships && f.memberships.length > 0)) && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {f.supervisoryAuthority && (
                        <div>
                          <h4 className="heading-item">Aufsichtsbehörde</h4>
                          <p className="mt-1 text-text-secondary">{f.supervisoryAuthority}</p>
                        </div>
                      )}
                      {f.memberships && f.memberships.length > 0 && (
                        <div>
                          <h4 className="heading-item">Mitgliedschaften</h4>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {f.memberships.map((m) => (
                              <span key={m} className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{m}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {f.uid && (
                    <div>
                      <h4 className="heading-item">UID</h4>
                      <p className="mt-1 font-mono text-text-secondary">{f.uid}</p>
                    </div>
                  )}
                  {f.researchNotes && (
                    <div>
                      <h4 className="heading-item">Recherche-Notizen</h4>
                      <p className="mt-1 text-text-secondary">{f.researchNotes}</p>
                    </div>
                  )}
                </div>
              </Card>
            );

          default:
            return null;
        }
      }}
    </Tabs>
    </>
  );
}
