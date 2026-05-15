'use client';

import { useState, useEffect } from 'react';
import { getApplications } from '@/lib/api/applications';

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
    getApplications()
      .then((result) => {
        if (result.success) {
          const slugs = new Set<string>(
            (result.data as Array<{ application: { foundationId: string } }>)
              .map((item) => item.application.foundationId)
              .filter(Boolean),
          );
          setPipelineSlugs(slugs);
        } else {
          setPipelineError(true);
        }
      })
      .catch(() => setPipelineError(true))
      .finally(() => setPipelineLoading(false));
  }, []);

  return { pipelineSlugs, pipelineLoading, pipelineError };
}
