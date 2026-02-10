'use client';

import Tabs from '@/components/ui/Tabs';
import FitAnalysis from '@/components/foundation/FitAnalysis';
import Card from '@/components/ui/Card';
import type { Foundation } from '@/lib/schemas/foundation';
import { TYPE_LABELS } from '@/lib/config/foundations';

interface Props {
  foundation: Foundation;
}

export default function FoundationDetailTabs({ foundation: f }: Props) {
  const typeLabel = TYPE_LABELS[f.type];

  const tabs = [
    { id: 'fit', label: 'Fit-Analyse', icon: '🎯' },
    { id: 'strategy', label: 'Strategie', icon: '📋' },
    { id: 'details', label: 'Details', icon: '📄' },
  ];

  return (
    <Tabs tabs={tabs}>
      {(activeTab) => {
        switch (activeTab) {
          case 'fit':
            return <FitAnalysis foundation={f} />;

          case 'strategy':
            return (
              <Card>
                <h3 className="mb-4 text-lg font-semibold text-grey-dark">Bewerbungsstrategie</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-grey-dark">Stiftungstyp</h4>
                    <p className="mt-1 text-sm text-text-light">
                      <strong>Typ {typeLabel.short}:</strong> {typeLabel.desc}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-grey-dark">Empfohlener Ansatz</h4>
                    <p className="mt-1 text-sm text-text-light">{typeLabel.approach}</p>
                  </div>
                  {f.deadlines && f.deadlines.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-grey-dark">Eingabefristen</h4>
                      <table className="mt-2 w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="py-2 text-left text-xs font-semibold text-text-muted">Eingabe bis</th>
                            <th className="py-2 text-left text-xs font-semibold text-text-muted">Antwort</th>
                          </tr>
                        </thead>
                        <tbody>
                          {f.deadlines.map((d, i) => (
                            <tr key={i} className="border-b border-border">
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
                      <h4 className="text-sm font-semibold text-grey-dark">Antwortzeit</h4>
                      <p className="mt-1 text-sm text-text-light">{f.responseTime}</p>
                    </div>
                  )}
                  {f.decisionCycle && (
                    <div>
                      <h4 className="text-sm font-semibold text-grey-dark">Entscheidungszyklus</h4>
                      <p className="mt-1 text-sm text-text-light">{f.decisionCycle}</p>
                    </div>
                  )}
                  {f.applicationProcess && f.applicationProcess.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-grey-dark">Bewerbungsprozess</h4>
                      <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-text-light">
                        {f.applicationProcess.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </Card>
            );

          case 'details':
            return (
              <Card>
                <h3 className="mb-4 text-lg font-semibold text-grey-dark">Details</h3>
                <div className="space-y-4 text-sm">
                  {f.purposeSummary && (
                    <div>
                      <h4 className="font-semibold text-grey-dark">Stiftungszweck</h4>
                      <p className="mt-1 text-text-light">{f.purposeSummary}</p>
                    </div>
                  )}
                  {f.criteria && (
                    <div>
                      <h4 className="font-semibold text-grey-dark">Förderkriterien</h4>
                      {f.criteria.nature && <p className="mt-1 text-text-light">{f.criteria.nature}</p>}
                      {f.criteria.education && <p className="mt-1 text-text-light">{f.criteria.education}</p>}
                    </div>
                  )}
                  {f.sdgs && f.sdgs.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-grey-dark">SDGs</h4>
                      <div className="mt-1 flex gap-2">
                        {f.sdgs.map((sdg) => (
                          <span key={sdg} className="rounded bg-bg-light px-2 py-1 text-xs font-medium">
                            SDG {sdg}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Board Members */}
                  {f.boardMembers && f.boardMembers.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-grey-dark">Stiftungsrat</h4>
                      <div className="mt-2 space-y-1">
                        {f.boardMembers.map((m) => (
                          <div key={m.name} className="flex items-baseline justify-between border-b border-border py-1">
                            <span className="text-text">{m.name}</span>
                            <span className="text-xs text-text-muted">{m.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Past Grantees */}
                  {f.pastGrantees && f.pastGrantees.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-grey-dark">Bisherige Förderempfänger</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {f.pastGrantees.map((g) => (
                          <span key={g} className="rounded bg-bg-light px-2 py-1 text-xs">{g}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Supervisory Authority + Memberships */}
                  {(f.supervisoryAuthority || (f.memberships && f.memberships.length > 0)) && (
                    <div className="grid grid-cols-2 gap-4">
                      {f.supervisoryAuthority && (
                        <div>
                          <h4 className="font-semibold text-grey-dark">Aufsichtsbehörde</h4>
                          <p className="mt-1 text-text-light">{f.supervisoryAuthority}</p>
                        </div>
                      )}
                      {f.memberships && f.memberships.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-grey-dark">Mitgliedschaften</h4>
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
                      <h4 className="font-semibold text-grey-dark">UID</h4>
                      <p className="mt-1 font-mono text-text-light">{f.uid}</p>
                    </div>
                  )}
                  {f.researchNotes && (
                    <div>
                      <h4 className="font-semibold text-grey-dark">Recherche-Notizen</h4>
                      <p className="mt-1 text-text-light">{f.researchNotes}</p>
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
  );
}
