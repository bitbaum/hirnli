'use client';

import { Button } from '@/components/ui/Button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

export default function ShareButton() {
  const { copied, copy } = useCopyToClipboard();

  return (
    <Button variant="secondary" size="sm" onClick={() => copy(window.location.href)}>
      {copied ? '✓ Link kopiert' : '🔗 Seite teilen'}
    </Button>
  );
}
