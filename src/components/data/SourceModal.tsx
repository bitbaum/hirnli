'use client';

import type { NumberSource } from '@/lib/config/numbers';
import { formatCHF } from '@/lib/utils/format';

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  estimated: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  target: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  unknown: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const CONFIDENCE_LABELS: Record<string, string> = {
  high: 'Hoch (verifiziert)',
  medium: 'Mittel (Schätzung mit Basis)',
  estimated: 'Geschätzt (Prognose)',
  target: 'Budget-Ziel (noch nicht realisiert)',
  unknown: 'Unbekannt (Daten fehlen)',
};

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
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {formattedValue}
              </div>
              <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {data.label}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
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
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Verlässlichkeit
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${CONFIDENCE_COLORS[data.source.confidence] ?? CONFIDENCE_COLORS.unknown}`}>
              {CONFIDENCE_LABELS[data.source.confidence] ?? CONFIDENCE_LABELS.unknown}
            </span>
          </div>

          {/* Methodology */}
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Methodik
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {data.source.methodology}
            </div>
          </div>

          {/* Calculation (if exists) */}
          {data.source.calculation && (
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Berechnung
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 font-mono text-sm text-gray-700 dark:text-gray-300">
                {data.source.calculation}
              </div>
            </div>
          )}

          {/* Last Verified */}
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Zuletzt verifiziert
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              {new Date(data.source.lastVerified).toLocaleDateString('de-CH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* Download Link */}
          {data.source.documentUrl && (
            <div>
              <a
                href={data.source.documentUrl}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Quelldokument herunterladen (PDF)
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
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
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
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Alle Zahlen auf dieser Seite sind klickbar und vollständig nachvollziehbar.
          </p>
        </div>
      </div>
    </div>
  );
}
