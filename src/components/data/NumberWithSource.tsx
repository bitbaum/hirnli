'use client';

import { useState } from 'react';
import { NUMBERS_REGISTRY, type NumberSource } from '@/lib/config/numbers';
import { formatCHF } from '@/lib/utils/format';

interface NumberWithSourceProps {
  numberKey: keyof typeof NUMBERS_REGISTRY;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

const SIZE_CLASSES = {
  sm: 'text-lg font-semibold',
  md: 'text-2xl font-bold',
  lg: 'text-4xl font-bold',
  xl: 'text-5xl font-bold',
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  estimated: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  target: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  unknown: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

/**
 * NumberWithSource - Clickable number that opens source modal
 *
 * Ground Truth #2: Single Source of Truth
 * - All numbers come from NUMBERS_REGISTRY
 * - Click to see source, methodology, confidence
 * - Download button if documentUrl exists
 *
 * Usage:
 *   <NumberWithSource numberKey="CO2_SAVED_PER_LAPTOP" size="xl" />
 */
export function NumberWithSource({
  numberKey,
  className = '',
  size = 'md',
  showLabel = true,
}: NumberWithSourceProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const data = NUMBERS_REGISTRY[numberKey];

  if (!data) {
    console.error(`NumberWithSource: Unknown key "${numberKey}"`);
    return null;
  }

  const formattedValue = typeof data.value === 'number' && data.category === 'financial'
    ? formatCHF(data.value)
    : data.value.toLocaleString('de-CH');

  return (
    <>
      {/* Clickable Number */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          group cursor-pointer text-left transition-all
          hover:scale-105 active:scale-95
          ${className}
        `}
        aria-label={`Quelle anzeigen für ${data.label}`}
      >
        <div className="relative">
          <div className={`${SIZE_CLASSES[size]} text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300`}>
            {formattedValue}
          </div>
          {showLabel && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {data.label}
            </div>
          )}
          {/* Underline indicator */}
          <div className="h-0.5 bg-blue-600 dark:bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
          {/* Info icon */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-blue-600 dark:text-blue-400">i</span>
          </div>
        </div>
      </button>

      {/* Source Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className={`${SIZE_CLASSES.lg} text-blue-600 dark:text-blue-400 mb-2`}>
                    {formattedValue}
                  </div>
                  <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {data.label}
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
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
                  {data.source.confidence === 'high' && 'Hoch (verifiziert)'}
                  {data.source.confidence === 'medium' && 'Mittel (Schätzung mit Basis)'}
                  {data.source.confidence === 'estimated' && 'Geschätzt (Prognose)'}
                  {data.source.confidence === 'target' && 'Budget-Ziel (noch nicht realisiert)'}
                  {data.source.confidence === 'unknown' && 'Unbekannt (Daten fehlen)'}
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
      )}
    </>
  );
}

/**
 * NumberGrid - Display multiple numbers in a grid
 *
 * Usage:
 *   <NumberGrid numbers={['CO2_SAVED_PER_LAPTOP', 'LAPTOPS_REFURBISHED_TOTAL']} />
 */
interface NumberGridProps {
  numbers: Array<keyof typeof NUMBERS_REGISTRY>;
  columns?: 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function NumberGrid({ numbers, columns = 3, size = 'md' }: NumberGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {numbers.map((key) => (
        <div key={key} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <NumberWithSource numberKey={key} size={size} showLabel={true} />
        </div>
      ))}
    </div>
  );
}

/**
 * InlineNumber - Use in running text
 *
 * Usage:
 *   We save <InlineNumber numberKey="CO2_SAVED_PER_LAPTOP" /> per laptop.
 */
interface InlineNumberProps {
  numberKey: keyof typeof NUMBERS_REGISTRY;
}

export function InlineNumber({ numberKey }: InlineNumberProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const data = NUMBERS_REGISTRY[numberKey];

  if (!data) return null;

  const formattedValue = typeof data.value === 'number' && data.category === 'financial'
    ? formatCHF(data.value)
    : data.value.toLocaleString('de-CH');

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        aria-label={`Quelle anzeigen für ${data.label}`}
      >
        {formattedValue}
      </button>

      {/* Reuse same modal as NumberWithSource */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
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
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verlässlichkeit
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${CONFIDENCE_COLORS[data.source.confidence] ?? CONFIDENCE_COLORS.unknown}`}>
                  {data.source.confidence === 'high' && 'Hoch (verifiziert)'}
                  {data.source.confidence === 'medium' && 'Mittel (Schätzung mit Basis)'}
                  {data.source.confidence === 'estimated' && 'Geschätzt (Prognose)'}
                  {data.source.confidence === 'target' && 'Budget-Ziel (noch nicht realisiert)'}
                  {data.source.confidence === 'unknown' && 'Unbekannt (Daten fehlen)'}
                </span>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Methodik
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {data.source.methodology}
                </div>
              </div>

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

            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 p-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Alle Zahlen auf dieser Seite sind klickbar und vollständig nachvollziehbar.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
