'use client';

import { useState, useEffect } from 'react';

interface PipelineEntriesState {
  pipelineSlugs: Set<string>;
  pipelineLoading: boolean;
  pipelineError: boolean;
}

export function usePipelineEntries(): PipelineEntriesState {
  const [pipelineSlugs, setPipelineSlugs] = useState<Set<string>>(new Set());
  const [pipelineLoading, setPipelineLoading] = useState(true);
  const [pipelineError, setPipelineError] = useState(false);

  useEffect(() => {
    fetch('/api/applications')
      .then((r) => r.json())
      .then((result) => {
        if (result.success) {
          const slugs = new Set<string>(
            result.data
              .map((item: { application: { foundationId: string } }) => item.application.foundationId)
              .filter(Boolean),
          );
          setPipelineSlugs(slugs);
        } else {
          setPipelineError(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load pipeline data:', err);
        setPipelineError(true);
      })
      .finally(() => setPipelineLoading(false));
  }, []);

  return { pipelineSlugs, pipelineLoading, pipelineError };
}
