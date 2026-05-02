'use client';

import type { NumberSource } from '@/lib/config/numbers';
import { CONFIDENCE_DISPLAY_LABELS, CONFIDENCE_COLORS } from '@/lib/config/numbers';
import { formatDateCHLong } from '@/lib/utils/format';

interface SourceModalProps {
  data: NumberSource;
  formattedValue: string;
  onClose: () => void;
}

/**
 * SourceModal — Shared modal for NumberWithSource and InlineNumber.
 * Shows source, methodology, confidence, and links for any number.
 */
export default function SourceModal({ data, formattedValue, onClose }: SourceModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">
                {formattedValue}
              </div>
              <div className="text-lg font-medium text-grey-dark">
                {data.label}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text text-2xl leading-none"
              aria-label="Schliessen"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Confidence Badge */}
          <div>
            <div className="text-sm font-medium text-grey-dark mb-2">
              Verlässlichkeit
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${CONFIDENCE_COLORS[data.source.confidence] ?? CONFIDENCE_COLORS.unknown}`}>
              {CONFIDENCE_DISPLAY_LABELS[data.source.confidence] ?? CONFIDENCE_DISPLAY_LABELS.unknown}
            </span>
          </div>

          {/* Methodology */}
          <div>
            <div className="text-sm font-medium text-grey-dark mb-2">
              Methodik
            </div>
            <div className="text-text-light text-sm leading-relaxed">
              {data.source.methodology}
            </div>
          </div>

          {/* Calculation (if exists) */}
          {data.source.calculation && (
            <div>
              <div className="text-sm font-medium text-grey-dark mb-2">
                Berechnung
              </div>
              <div className="bg-bg-light rounded-lg p-4 font-mono text-sm text-grey-dark">
                {data.source.calculation}
              </div>
            </div>
          )}

          {/* Last Verified */}
          <div>
            <div className="text-sm font-medium text-grey-dark mb-2">
              Zuletzt verifiziert
            </div>
            <div className="text-text-light text-sm">
              {formatDateCHLong(data.source.lastVerified)}
            </div>
          </div>

          {/* Download Link */}
          {data.source.documentUrl && (
            <div>
              <a
                href={data.source.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-grey-dark px-4 py-2 text-white transition-colors hover:bg-grey-dark/85"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Quelldokument ansehen (PDF)
              </a>
            </div>
          )}

          {/* External Link */}
          {data.source.externalLink && (
            <div>
              <a
                href={data.source.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Externe Quelle ansehen
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-bg-light border-t border-border p-4 text-center">
          <p className="text-sm text-text-muted">
            Alle Zahlen auf dieser Seite sind klickbar und vollständig nachvollziehbar.
          </p>
        </div>
      </div>
    </div>
  );
}
