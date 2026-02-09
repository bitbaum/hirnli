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
    setMounted(true);
  }, []);

  return (
    <div className={`rounded-lg border border-border bg-white p-4 ${className}`}>
      {title && <h3 className="mb-3 text-sm font-semibold text-grey-dark">{title}</h3>}
      {mounted ? (
        children
      ) : (
        <div className="flex h-64 items-center justify-center text-text-muted">
          Laden...
        </div>
      )}
    </div>
  );
}
