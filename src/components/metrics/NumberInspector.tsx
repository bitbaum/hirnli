'use client';

import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import type { InspectorData, InspectorSourceType } from '@/lib/schemas/inspector';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { CONFIDENCE_DISPLAY_LABELS } from '@/lib/config/numbers';

interface NumberInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  data: InspectorData | null;
}

const TYPE_LABELS: Record<InspectorSourceType, { label: string; variant: InspectorSourceType; icon: string }> = {
  live: { label: 'Live-Daten', variant: 'live', icon: '●' },
  derived: { label: 'Berechnet', variant: 'derived', icon: '◐' },
  estimated: { label: 'Schätzung', variant: 'estimated', icon: '○' },
  none: { label: 'Keine Quelle', variant: 'none', icon: '?' },
};

export default function NumberInspector({ isOpen, onClose, data }: NumberInspectorProps) {
  if (!data) return null;

  const typeInfo = TYPE_LABELS[data.sourceType] || TYPE_LABELS.none;

  // Convert technical source path to donor-friendly description
  const getDonorFriendlySource = (source: string): string => {
    // Remove file extensions and technical prefixes
    const cleanSource = source
      .replace(/\.xlsx?$/i, '')
      .replace(/\.ts$/i, '')
      .replace(/\.js$/i, '')
      .replace(/^.*\//, '') // Remove path, keep only filename
      .replace(/_/g, ' ')
      .replace(/-/g, ' ');

    // Map common sources to readable names
    const sourceMap: Record<string, string> = {
      'revamp Einnahmen 2025': 'Finanzbuchhaltung 2025 (Kivitendo)',
      'revamp Ausgaben 2025': 'Finanzbuchhaltung 2025 (Kivitendo)',
      'THREE YEAR MODEL': '3-Jahres-Budgetplan (erstellt Januar 2026)',
      'fundraising data': 'Fundraising-Strategie (verifiziert Februar 2026)',
      'app fundraising data': 'Fundraising-Strategie (verifiziert Februar 2026)',
    };

    return sourceMap[cleanSource] || `Interne Datenquelle: ${cleanSource}`;
  };

  const friendlySource = getDonorFriendlySource(data.source);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={data.label}>
      <div className="space-y-4">
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase text-text-muted">Aktueller Wert</h4>
          <div className="text-2xl font-bold text-grey-dark">{data.value}</div>
          <Badge variant={typeInfo.variant} className="mt-1">
            {typeInfo.icon} {typeInfo.label}
          </Badge>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase text-text-muted">Woher kommt diese Zahl?</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-lg">📊</span>
              <div className="flex-1">
                <div className="font-medium text-grey-dark">Datenquelle</div>
                <div className="text-text-light">{friendlySource}</div>
              </div>
            </div>
            {data.account && (
              <div className="flex items-start gap-2">
                <span className="text-lg">🏦</span>
                <div className="flex-1">
                  <div className="font-medium text-grey-dark">Buchungskonto</div>
                  <div className="text-text-light">{data.account}</div>
                </div>
              </div>
            )}
            {data.updated && (
              <div className="flex items-start gap-2">
                <span className="text-lg">📅</span>
                <div className="flex-1">
                  <div className="font-medium text-grey-dark">Zuletzt aktualisiert</div>
                  <div className="text-text-light">{data.updated}</div>
                </div>
              </div>
            )}
            {data.confidence && (
              <div className="flex items-start gap-2">
                <span className="text-lg">🎯</span>
                <div className="flex-1">
                  <div className="font-medium text-grey-dark">Verlässlichkeit</div>
                  <div className="text-text-light">
                    {CONFIDENCE_DISPLAY_LABELS[data.confidence as keyof typeof CONFIDENCE_DISPLAY_LABELS] ?? data.confidence}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {data.formula && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase text-text-muted">Wie wird das berechnet?</h4>
            <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3">
              <code className="block text-sm font-mono text-grey-dark whitespace-pre-wrap">{data.formula}</code>
            </div>
          </div>
        )}

        {data.description && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase text-text-muted">Was bedeutet das?</h4>
            <p className="text-sm text-text-light leading-relaxed">{data.description}</p>
          </div>
        )}

        {/* Transparency Footer */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-start gap-2 text-sm text-text-muted">
            <span className="text-sm">✓</span>
            <p>
              Alle Zahlen auf dieser Seite sind klickbar und vollständig nachvollziehbar.
              Bei Fragen zur Datenherkunft kontaktieren Sie uns unter{' '}
              <a href={`mailto:${ORG_PROFILE.email}`} className="text-primary hover:underline">
                {ORG_PROFILE.email}
              </a>
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
