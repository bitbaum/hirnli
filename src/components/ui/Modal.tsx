'use client';

import { useRef } from 'react';
import { useFocusTrap } from '@/lib/utils/a11y';
import { CloseButton } from './CloseButton';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Override the inner dialog className (default: max-w-lg) */
  className?: string;
}

export default function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, onClose, isOpen);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[80vh] w-full overflow-y-auto rounded-lg bg-surface-base shadow-lg ${className ?? 'max-w-lg'}`}
      >
        <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
          <h3 className="heading-card">{title}</h3>
          <CloseButton onClick={onClose} />
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
