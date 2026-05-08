'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleCopy}>
      {copied ? '✓ Link kopiert' : '🔗 Seite teilen'}
    </Button>
  );
}
