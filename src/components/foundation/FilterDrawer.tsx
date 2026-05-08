'use client';

import { useEffect } from 'react';
import FilterSidebar from './FilterSidebar';
import type { ComponentProps } from 'react';

type FilterDrawerProps = ComponentProps<typeof FilterSidebar> & {
  open: boolean;
  onClose: () => void;
};

export default function FilterDrawer({ open, onClose, ...sidebarProps }: FilterDrawerProps) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter"
        className={`fixed inset-y-0 left-0 z-50 w-[300px] max-w-[85vw] overflow-y-auto bg-white px-4 py-4 shadow-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="heading-detail">Filter</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-bg-light hover:text-grey-dark"
            aria-label="Filter schliessen"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <FilterSidebar {...sidebarProps} />
      </div>
    </>
  );
}
