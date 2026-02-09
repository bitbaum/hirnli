'use client';

import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

interface NumberInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    label: string;
    value: string;
    sourceType: 'live' | 'derived' | 'estimated' | 'none';
    source: string;
    account?: string;
    formula?: string;
    updated?: string;
    confidence?: string;
    description?: string;
  } | null;
}

const TYPE_LABELS = {
  live: { label: 'Live-Daten', variant: 'live' as const, icon: '●' },
  derived: { label: 'Berechnet', variant: 'derived' as const, icon: '◐' },
  estimated: { label: 'Schätzung', variant: 'estimated' as const, icon: '○' },
  none: { label: 'Keine Quelle', variant: 'none' as const, icon: '?' },
};

export default function NumberInspector({ isOpen, onClose, data }: NumberInspectorProps) {
  if (!data) return null;

  const typeInfo = TYPE_LABELS[data.sourceType] || TYPE_LABELS.none;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${data.label} inspizieren`}>
      <div className="space-y-4">
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase text-text-muted">Aktueller Wert</h4>
          <div className="text-2xl font-bold text-grey-dark">{data.value}</div>
          <Badge variant={typeInfo.variant} className="mt-1">
            {typeInfo.icon} {typeInfo.label}
          </Badge>
        </div>

        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase text-text-muted">Datenquelle</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span>📁</span> {data.source}
            </div>
            {data.account && (
              <div className="flex items-center gap-2">
                <span>📊</span> Konto: {data.account}
              </div>
            )}
            {data.updated && (
              <div className="flex items-center gap-2">
                <span>🗓️</span> Aktualisiert: {data.updated}
              </div>
            )}
            {data.confidence && (
              <div className="flex items-center gap-2">
                <span>🎯</span> Konfidenz: {data.confidence}
              </div>
            )}
          </div>
        </div>

        {data.formula && (
          <div>
            <h4 className="mb-1 text-xs font-semibold uppercase text-text-muted">Berechnungsformel</h4>
            <code className="block rounded bg-bg-light px-3 py-2 text-sm font-mono">{data.formula}</code>
          </div>
        )}

        {data.description && (
          <div>
            <h4 className="mb-1 text-xs font-semibold uppercase text-text-muted">Beschreibung</h4>
            <p className="text-sm text-text-light">{data.description}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
