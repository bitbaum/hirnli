'use client';

import { useEffect, useState } from 'react';

interface ChartWrapperProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

/**
 * Wrapper that handles client-side-only rendering for Chart.js components.
 * Chart.js requires window/document, so we defer rendering until mount.
 */
export default function ChartWrapper({ children, title, className = '' }: ChartWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount detection for Chart.js (requires window/document)
    setMounted(true);
  }, []);

  return (
    <div className={`rounded-lg border border-border bg-white p-4 ${className}`}>
      {title && <h2 className="mb-3 text-sm font-semibold text-grey-dark">{title}</h2>}
      <div className="h-72">
        {mounted ? (
          children
        ) : (
          <div className="flex h-full items-center justify-center text-text-muted">
            Laden...
          </div>
        )}
      </div>
    </div>
  );
}
