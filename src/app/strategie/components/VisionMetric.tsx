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
          rounded-lg bg-white/10 p-4
          transition-all duration-200
          ${source ? 'cursor-pointer hover:bg-white/20 hover:scale-105' : ''}
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
          <div className="mt-2 text-xs opacity-75 flex items-center gap-1">
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
              <h4 className="font-semibold text-sm text-grey-dark mb-2">Zielwert</h4>
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="text-sm text-text-light mt-1">{label}</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-grey-dark mb-2">Methodik</h4>
              <p className="text-sm text-text-light">{source.methodology}</p>
            </div>

            {source.confidence && (
              <div>
                <h4 className="font-semibold text-sm text-grey-dark mb-2">Vertrauensniveau</h4>
                <p className="text-sm text-text-light capitalize">{source.confidence}</p>
              </div>
            )}

            {source.lastVerified && (
              <div>
                <h4 className="font-semibold text-sm text-grey-dark mb-2">Zuletzt geprüft</h4>
                <p className="text-sm text-text-light">{source.lastVerified}</p>
              </div>
            )}

            {source.notes && (
              <div>
                <h4 className="font-semibold text-sm text-grey-dark mb-2">Notizen</h4>
                <p className="text-sm text-text-light">{source.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
