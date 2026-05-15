import { DATA_QUALITY } from '../data';

interface DataQualityBannerProps {
  className?: string;
}

export function DataQualityBanner({ className = 'mb-6' }: DataQualityBannerProps) {
  return (
    <div className={`rounded-lg border-2 border-warning/50 bg-warning-bg/30 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-xl text-warning">&#9888;</span>
        <div>
          <h3 className="heading-detail">Wichtig: Eingeschränkte Datenverfügbarkeit</h3>
          <p className="mt-1 text-sm text-text-light">
            <strong>Vollständige P&L (Einnahmen + Aufwände):</strong> {DATA_QUALITY.completeRange}.{' '}
            <strong>Nur Einnahmen:</strong> {DATA_QUALITY.incompleteRange} — Aufwände wurden im Buchhaltungssystem nicht verbucht.
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Quelle: {DATA_QUALITY.source}. {DATA_QUALITY.caveat}
          </p>
        </div>
      </div>
    </div>
  );
}
