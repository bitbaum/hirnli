'use client';

import { useState, useId } from 'react';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  count?: number;
  id?: string;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  defaultOpen = false,
  count,
  id,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const autoId = useId();
  const base = id ?? autoId;
  const buttonId = `${base}-button`;
  const panelId = `${base}-panel`;

  return (
    <div className="border-b border-border pb-3">
      <button
        id={buttonId}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
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
        <span
          className={`text-xs transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          aria-hidden="true"
        >
          ▸
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-1 pt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
