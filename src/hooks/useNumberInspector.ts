'use client';

import { useState, useCallback } from 'react';

interface InspectorData {
  label: string;
  value: string;
  sourceType: 'live' | 'derived' | 'estimated' | 'none';
  source: string;
  account?: string;
  formula?: string;
  updated?: string;
  confidence?: string;
  description?: string;
}

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
