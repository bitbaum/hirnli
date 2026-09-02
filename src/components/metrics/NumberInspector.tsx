'use client';

import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { INSPECTOR_SOURCE_ICONS } from '@/lib/schemas/inspector';
import type { InspectorData, InspectorSourceType } from '@/lib/schemas/inspector';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { CONFIDENCE_DISPLAY_LABELS } from '@/lib/config/numbers';

interface NumberInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  data: InspectorData | null;
}

const TYPE_LABELS: Record<InspectorSourceType, { label: string; variant: InspectorSourceType }> = {
  live: { label: 'Live-Daten', variant: 'live' },
  derived: { label: 'Berechnet', variant: 'derived' },
  estimated: { label: 'Schätzung', variant: 'estimated' },
  none: { label: 'Keine Quelle', variant: 'none' },
};

export default function NumberInspector({ isOpen, onClose, data }: NumberInspectorProps) {
  if (!data) return null;

  const typeInfo = TYPE_LABELS[data.sourceType];

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
          <h4 className="mb-1 heading-xs-label">Aktueller Wert</h4>
          <div className="heading-section">{data.value}</div>
          <Badge variant={typeInfo.variant} className="mt-1">
            {INSPECTOR_SOURCE_ICONS[typeInfo.variant]} {typeInfo.label}
          </Badge>
        </div>

        <div>
          <h4 className="mb-2 heading-xs-label">Woher kommt diese Zahl?</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-lg">📊</span>
              <div className="flex-1">
                <div className="heading-detail">Datenquelle</div>
                <div className="text-text-secondary">{friendlySource}</div>
              </div>
            </div>
            {data.account && (
              <div className="flex items-start gap-2">
                <span className="text-lg">🏦</span>
                <div className="flex-1">
                  <div className="heading-detail">Buchungskonto</div>
                  <div className="text-text-secondary">{data.account}</div>
                </div>
              </div>
            )}
            {data.updated && (
              <div className="flex items-start gap-2">
                <span className="text-lg">📅</span>
                <div className="flex-1">
                  <div className="heading-detail">Zuletzt aktualisiert</div>
                  <div className="text-text-secondary">{data.updated}</div>
                </div>
              </div>
            )}
            {data.confidence && (
              <div className="flex items-start gap-2">
                <span className="text-lg">🎯</span>
                <div className="flex-1">
                  <div className="heading-detail">Verlässlichkeit</div>
                  <div className="text-text-secondary">
                    {CONFIDENCE_DISPLAY_LABELS[
                      data.confidence as keyof typeof CONFIDENCE_DISPLAY_LABELS
                    ] ?? data.confidence}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {data.formula && (
          <div>
            <h4 className="mb-2 heading-xs-label">Wie wird das berechnet?</h4>
            <div className="rounded-lg bg-accent-muted border border-accent-border px-4 py-3">
              <code className="block text-sm font-mono text-text-primary whitespace-pre-wrap">
                {data.formula}
              </code>
            </div>
          </div>
        )}

        {data.description && (
          <div>
            <h4 className="mb-2 heading-xs-label">Was bedeutet das?</h4>
            <p className="text-sm text-text-secondary leading-relaxed">{data.description}</p>
          </div>
        )}

        {/* Transparency Footer */}
        <div className="pt-4 border-t border-border-default">
          <div className="flex items-start gap-2 text-sm text-text-muted">
            <span className="text-sm">✓</span>
            <p>
              Alle Zahlen auf dieser Seite sind klickbar und vollständig nachvollziehbar. Bei Fragen
              zur Datenherkunft kontaktieren Sie uns unter{' '}
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
