'use client';

import { useRef } from 'react';
import FilterSidebar from './FilterSidebar';
import type { ComponentProps } from 'react';
import { useFocusTrap } from '@/lib/utils/a11y';
import { CloseButton } from '@/components/ui/CloseButton';

type FilterDrawerProps = ComponentProps<typeof FilterSidebar> & {
  open: boolean;
  onClose: () => void;
};

export default function FilterDrawer({ open, onClose, ...sidebarProps }: FilterDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(drawerRef, onClose, open);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
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
          <CloseButton onClick={onClose} label="Filter schliessen" />
        </div>

        <FilterSidebar {...sidebarProps} />
      </div>
    </>
  );
}
