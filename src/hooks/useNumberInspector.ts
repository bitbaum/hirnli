'use client';

import { useState, useCallback } from 'react';
import type { InspectorData } from '@/lib/schemas/inspector';

export function useNumberInspector() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<InspectorData | null>(null);

  const inspect = useCallback((inspectorData: InspectorData) => {
    setData(inspectorData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, data, inspect, close };
}
