'use client';

import { useState } from 'react';
import AddToPipelineButton from './AddToPipelineButton';
import { Button } from '@/components/ui/Button';

interface Props {
  foundationId: string;
  foundationName: string;
  gesuchReady: boolean;
}

export default function MobileFoundationActions({ foundationId, foundationName, gesuchReady }: Props) {
  const [inPipeline, setInPipeline] = useState(false);

  return (
    <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
      <AddToPipelineButton
        foundationId={foundationId}
        foundationName={foundationName}
        onConflict={() => setInPipeline(true)}
      />
      {gesuchReady && !inPipeline && (
        <>
          <Button href={`/fundraising/stiftungen/${foundationId}/gesuch`} size="sm">
            Gesuch öffnen
          </Button>
          <Button
            href={`/api/pdf/gesuch/${foundationId}`}
            variant="secondary"
            size="sm"
            target="_blank"
          >
            PDF
          </Button>
        </>
      )}
    </div>
  );
}
