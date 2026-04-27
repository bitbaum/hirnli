// ---------------------------------------------------------------------------
// DataQualityBanner — transparent data quality warning
// ---------------------------------------------------------------------------

import { DATA_QUALITY } from '../data';

export function DataQualityBanner() {
  return (
    <div className="mb-6 rounded-lg border border-warning/30 bg-warning-bg/20 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-lg text-warning">&#9888;</span>
        <div>
          <h3 className="text-sm font-semibold text-grey-dark">
            Datenqualität & Transparenz
          </h3>
          <p className="mt-1 text-sm text-text-light">
            <strong>Vollständige Erfolgsrechnung:</strong> {DATA_QUALITY.completeRange} (Einnahmen + Aufwände).{' '}
            <strong>Nur Einnahmen:</strong> {DATA_QUALITY.incompleteRange} — Aufwände wurden im Buchhaltungssystem nicht verbucht.
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Quelle: {DATA_QUALITY.source}
          </p>
        </div>
      </div>
    </div>
  );
}
