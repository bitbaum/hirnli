'use client';

import { useState, useEffect } from 'react';
import { getApplications, type FoundationApplicationRow } from '@/lib/api/applications';

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
    let cancelled = false;
    getApplications()
      .then((result) => {
        if (cancelled) return;
        if (result.success) {
          // `result.data` shape is owned by FoundationApplicationRow — using the
          // canonical type here keeps this hook in sync if the API ever adds
          // fields (e.g. status, submissionDate) the kanban already reads.
          const rows = (result.data as FoundationApplicationRow[] | undefined) ?? [];
          const slugs = new Set<string>(
            rows.map((row) => row.application.foundationId).filter(Boolean),
          );
          setPipelineSlugs(slugs);
        } else {
          setPipelineError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setPipelineError(true);
      })
      .finally(() => {
        if (!cancelled) setPipelineLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { pipelineSlugs, pipelineLoading, pipelineError };
}
