'use client';

import type { InspectorData } from '@/lib/schemas/inspector';
import type { useNumberInspector } from '@/hooks/useNumberInspector';

export type InspectorHandle = ReturnType<typeof useNumberInspector>;

export default function Inspectable({
  children,
  data,
  inspector,
  className = '',
}: {
  children: React.ReactNode;
  data: InspectorData;
  inspector: InspectorHandle;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => inspector.inspect(data)}
      className={`cursor-pointer underline decoration-dotted decoration-1 underline-offset-2 hover:decoration-solid ${className}`}
      title="Klicken für Quellenangabe"
    >
      {children}
    </button>
  );
}
