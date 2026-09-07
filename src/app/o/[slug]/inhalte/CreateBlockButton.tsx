'use client';

/**
 * Starting a content block that does not exist yet.
 *
 * A button rather than something automatic. Creating a budget changes what the
 * organisation sends to funders — a Gesuch composed without one has no budget
 * section, which is correct until there are figures — so beginning it is a
 * decision the customer makes, not a side effect of visiting a page.
 */

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { createBlock, type SaveState } from './[block]/actions';

export function CreateBlockButton({ orgSlug, blockKey }: { orgSlug: string; blockKey: string }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(createBlock, {});

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <input type="hidden" name="block" value={blockKey} />
      <Button type="submit" disabled={pending}>
        {pending ? 'Wird angelegt …' : 'Anlegen'}
      </Button>
      {state.error && <span className="text-sm text-status-error">{state.error}</span>}
    </form>
  );
}
