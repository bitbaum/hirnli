'use client';

/**
 * The form. Client-side only so the address preview updates as you type —
 * seeing `ihre-organisation.hirnli.orangecat.ch` appear is what makes the slug
 * rule legible before submitting rather than after.
 */

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { createOrganization, type CreateOrgState } from './actions';
import { slugify } from '@/lib/tenant/org-naming';

const FIELD =
  'mt-1 w-full min-h-11 rounded-lg border border-border-default bg-surface-base px-3 text-sm text-text-primary';

export function CreateOrganizationForm({
  platformHost,
  defaultEmail,
}: {
  platformHost: string;
  defaultEmail: string;
}) {
  const [state, action, pending] = useActionState<CreateOrgState, FormData>(createOrganization, {});
  const [name, setName] = useState('');
  const slug = slugify(name);

  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <label className="text-sm font-medium text-text-primary">
        Name der Organisation
        <input
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={FIELD}
          placeholder="Beispiel-Verein"
        />
      </label>

      {/* The address is derived, so show it rather than asking for it twice. */}
      <p className="-mt-2 text-xs text-text-muted">
        Ihre Adresse:{' '}
        <span className="font-mono">{slug ? `${slug}.${platformHost}` : `…​.${platformHost}`}</span>
      </p>

      <label className="text-sm font-medium text-text-primary">
        Rechtsform
        <input
          name="legalForm"
          required
          className={FIELD}
          placeholder="Verein nach Art. 60 ff. ZGB"
        />
      </label>

      <div className="flex gap-4">
        <label className="flex-1 text-sm font-medium text-text-primary">
          Gegründet
          <input
            name="founded"
            type="number"
            required
            min={1800}
            max={new Date().getFullYear()}
            className={FIELD}
            placeholder="2026"
          />
        </label>
        <label className="flex-1 text-sm font-medium text-text-primary">
          Ort
          <input name="location" required className={FIELD} placeholder="Zürich" />
        </label>
      </div>

      <label className="text-sm font-medium text-text-primary">
        E-Mail der Organisation
        <input name="email" type="email" required defaultValue={defaultEmail} className={FIELD} />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-error">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? 'Wird erstellt …' : 'Organisation erstellen'}
      </Button>
    </form>
  );
}
