'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { acceptInvitation, type AcceptState } from './actions';

export function AcceptForm({ invitationId }: { invitationId: string }) {
  const [state, action, pending] = useActionState<AcceptState, FormData>(acceptInvitation, {});

  return (
    <form action={action} className="mt-6 flex flex-col gap-3">
      <input type="hidden" name="invitationId" value={invitationId} />
      {state.error && (
        <p role="alert" className="text-sm text-status-error">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} size="lg">
        {pending ? 'Wird angenommen …' : 'Einladung annehmen'}
      </Button>
    </form>
  );
}
