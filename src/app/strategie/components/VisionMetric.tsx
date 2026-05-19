'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';

interface VisionMetricProps {
  value: string;
  label: string;
  source?: {
    methodology: string;
    confidence?: string;
    lastVerified?: string;
    notes?: string;
  };
}

export default function VisionMetric({ value, label, source }: VisionMetricProps) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (source) {
      setShowModal(true);
    }
  };

  return (
    <>
      <div
        className={`
          rounded-lg bg-surface-overlay p-4
          transition-hover
          ${source ? 'cursor-pointer hover:bg-surface-raised/50 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent' : ''}
        `}
        onClick={handleClick}
        role={source ? 'button' : undefined}
        tabIndex={source ? 0 : undefined}
        onKeyDown={(e) => {
          if (source && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick();
          }
        }}
        title={source ? 'Klicken für Details zur Datenquelle' : undefined}
      >
        <strong className="block text-xl">{value}</strong>
        <span className="text-sm opacity-90">{label}</span>
        {source && (
          <div className="mt-2 text-sm opacity-75 flex items-center gap-1">
            <span>ℹ️</span>
            <span>Quelle anzeigen</span>
          </div>
        )}
      </div>

      {source && showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`Vision 2030: ${label}`}
        >
          <div className="space-y-4">
            <div>
              <h4 className="heading-detail mb-2">Zielwert</h4>
              <p className="heading-section text-primary">{value}</p>
              <p className="text-sm text-text-secondary mt-1">{label}</p>
            </div>

            <div>
              <h4 className="heading-detail mb-2">Methodik</h4>
              <p className="text-sm text-text-secondary">{source.methodology}</p>
            </div>

            {source.confidence && (
              <div>
                <h4 className="heading-detail mb-2">Vertrauensniveau</h4>
                <p className="text-sm text-text-secondary capitalize">{source.confidence}</p>
              </div>
            )}

            {source.lastVerified && (
              <div>
                <h4 className="heading-detail mb-2">Zuletzt geprüft</h4>
                <p className="text-sm text-text-secondary">{source.lastVerified}</p>
              </div>
            )}

            {source.notes && (
              <div>
                <h4 className="heading-detail mb-2">Notizen</h4>
                <p className="text-sm text-text-secondary">{source.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
