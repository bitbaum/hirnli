'use client';

import { useRef } from 'react';
import type { NumberSource } from '@/lib/config/numbers';
import { CONFIDENCE_DISPLAY_LABELS, CONFIDENCE_COLORS } from '@/lib/config/numbers';
import { formatDateCHLong } from '@/lib/utils/format';
import { Button } from '@/components/ui/Button';
import { CloseButton } from '@/components/ui/CloseButton';
import Backdrop from '@/components/ui/Backdrop';
import { useFocusTrap } from '@/lib/utils/a11y';

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
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, onClose);

  return (
    <Backdrop onClose={onClose} tone="darker" layer="modal" centered paddingClassName="p-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={data.label}
        className="bg-surface-base rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface-base border-b border-border-default p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">{formattedValue}</div>
              <div className="heading-card">{data.label}</div>
            </div>
            <CloseButton onClick={onClose} />
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Confidence Badge */}
          <div>
            <div className="heading-detail mb-2">Verlässlichkeit</div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${CONFIDENCE_COLORS[data.source.confidence] ?? CONFIDENCE_COLORS.unknown}`}
            >
              {CONFIDENCE_DISPLAY_LABELS[data.source.confidence] ??
                CONFIDENCE_DISPLAY_LABELS.unknown}
            </span>
          </div>

          {/* Methodology */}
          <div>
            <div className="heading-detail mb-2">Methodik</div>
            <div className="text-text-secondary text-sm leading-relaxed">
              {data.source.methodology}
            </div>
          </div>

          {/* Calculation (if exists) */}
          {data.source.calculation && (
            <div>
              <div className="heading-detail mb-2">Berechnung</div>
              <div className="bg-surface-raised rounded-lg p-4 font-mono text-sm text-text-primary">
                {data.source.calculation}
              </div>
            </div>
          )}

          {/* Last Verified */}
          <div>
            <div className="heading-detail mb-2">Zuletzt verifiziert</div>
            <div className="text-text-secondary text-sm">
              {formatDateCHLong(data.source.lastVerified)}
            </div>
          </div>

          {/* Download Link */}
          {data.source.documentUrl && (
            <div>
              <Button href={data.source.documentUrl}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Quelldokument ansehen (PDF)
              </Button>
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Externe Quelle ansehen
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface-raised border-t border-border-default p-4 text-center">
          <p className="text-sm text-text-muted">
            Alle Zahlen auf dieser Seite sind klickbar und vollständig nachvollziehbar.
          </p>
        </div>
      </div>
    </Backdrop>
  );
}
