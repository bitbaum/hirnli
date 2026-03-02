'use client';

import { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  count?: number;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  defaultOpen = false,
  count,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border pb-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-2 text-left text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-grey-dark"
      >
        <span className="flex items-center gap-1.5">
          {title}
          {count !== undefined && (
            <span className="rounded-full bg-grey-light px-1.5 py-0.5 text-xs font-medium normal-case tracking-normal text-text-muted">
              {count}
            </span>
          )}
        </span>
        <span className="text-xs">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="pb-1 pt-1">{children}</div>}
    </div>
  );
}
