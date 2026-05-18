'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { UI_TIMINGS } from '@/lib/config/ui-timings';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), UI_TIMINGS.copySuccess);
    });
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleCopy}>
      {copied ? '✓ Link kopiert' : '🔗 Seite teilen'}
    </Button>
  );
}
