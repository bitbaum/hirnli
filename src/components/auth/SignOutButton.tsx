'use client';

/**
 * The one sign-out control, for every chrome that has a signed-in person:
 * the platform nav and the organisation header. A form around a server
 * action, so it signs out even before the page has hydrated.
 */

import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { signOutOfHirnli } from '@/lib/auth/actions';

function Submit() {
  const t = useTranslations('common');
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="ghost" size="sm" disabled={pending}>
      {pending ? t('signingOut') : t('signOut')}
    </Button>
  );
}

export function SignOutButton() {
  return (
    <form action={signOutOfHirnli}>
      <Submit />
    </form>
  );
}
