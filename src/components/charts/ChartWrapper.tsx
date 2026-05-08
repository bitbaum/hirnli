'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';

interface ChartWrapperProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function ChartLoadingSkeleton() {
  return (
    <Card padding={false} className="flex h-80 items-center justify-center text-text-muted">
      Laden…
    </Card>
  );
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
    <Card padding={false} className={`p-4 ${className}`}>
      {title && <h2 className="mb-3 heading-detail">{title}</h2>}
      <div className="h-72">
        {mounted ? (
          children
        ) : (
          <div className="flex h-full items-center justify-center text-text-muted">
            Laden...
          </div>
        )}
      </div>
    </Card>
  );
}
