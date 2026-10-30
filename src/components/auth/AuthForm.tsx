'use client';

/**
 * Sign-in and sign-up share one form because they differ by three things: a
 * name field, which endpoint is called, and the wording. Two near-identical
 * components would drift — and the half that drifts is usually the error
 * handling, which is the half people only see on a bad day.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, signUp } from '@/lib/auth/client';
import { DEFAULT_AFTER_SIGN_IN, safeNextPath } from '@/lib/auth/next-path';
import type { SharedSignIn } from '@/lib/auth/shared-signin';

type Mode = 'signin' | 'signup';

const COPY = {
  signin: {
    heading: 'Anmelden',
    submit: 'Anmelden',
    pending: 'Wird angemeldet …',
    altPrompt: 'Noch kein Konto?',
    altLabel: 'Konto erstellen',
    altHref: '/registrieren',
  },
  signup: {
    heading: 'Konto erstellen',
    submit: 'Konto erstellen',
    pending: 'Wird erstellt …',
    altPrompt: 'Bereits registriert?',
    altLabel: 'Anmelden',
    altHref: '/anmelden',
  },
} as const;

export function AuthForm({
  mode,
  next,
  shared = null,
}: {
  mode: Mode;
  next?: string;
  /** The shared bitbaum sign-in, when its env is set (lib/auth/shared-signin). */
  shared?: SharedSignIn | null;
}) {
  const copy = COPY[mode];
  // Re-validated here as well as on the page. This value ends up in
  // router.push(), and the component is reachable from anywhere a prop can be
  // passed — a check on one caller is a check on one caller.
  const destination = safeNextPath(next);
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const result =
      mode === 'signup'
        ? await signUp.email({ name, email, password })
        : await signIn.email({ email, password });

    if (result.error) {
      // Say what went wrong and what to do — never "an error occurred".
      setError(
        result.error.message ??
          (mode === 'signup'
            ? 'Konto konnte nicht erstellt werden. Möglicherweise existiert diese E-Mail-Adresse bereits.'
            : 'E-Mail-Adresse oder Passwort stimmt nicht.'),
      );
      setPending(false);
      return;
    }

    // Back to whatever they were trying to reach, or the server-side chooser
    // at /start when there was nothing — that page decides where to land based
    // on how many organisations this person belongs to.
    router.push(destination);
    router.refresh();
  }

  // The provider creates the account on first use, so sign-up and sign-in are
  // the same call. Errors come back to this page, keeping `next`.
  async function onShared() {
    if (!shared) return;
    setError(null);
    setPending(true);
    const back =
      destination === DEFAULT_AFTER_SIGN_IN
        ? '/anmelden'
        : `/anmelden?next=${encodeURIComponent(destination)}`;
    const result = await signIn.social({
      provider: shared.provider,
      callbackURL: destination,
      errorCallbackURL: back,
    });
    if (result?.error) {
      setError(
        'Die Anmeldung konnte nicht gestartet werden. Bitte versuchen Sie es erneut oder melden Sie sich mit E-Mail-Adresse und Passwort an.',
      );
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">{copy.heading}</h1>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-border-default bg-surface-raised px-4 py-3 text-sm text-text-primary"
        >
          {error}
        </p>
      )}

      {shared && (
        <>
          <button
            type="button"
            onClick={onShared}
            disabled={pending}
            className="min-h-11 rounded-lg border border-border-default bg-surface-base px-4 font-medium text-text-primary disabled:opacity-60"
          >
            {shared.label}
          </button>
          <p className="text-center text-sm text-text-muted">oder mit E-Mail-Adresse</p>
        </>
      )}

      {mode === 'signup' && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-secondary">Name</span>
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="min-h-11 rounded-lg border border-border-default bg-surface-base px-3 text-text-primary"
          />
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-secondary">E-Mail-Adresse</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-11 rounded-lg border border-border-default bg-surface-base px-3 text-text-primary"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-secondary">Passwort</span>
        <input
          type="password"
          required
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="min-h-11 rounded-lg border border-border-default bg-surface-base px-3 text-text-primary"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-lg bg-text-primary px-4 font-medium text-surface-base disabled:opacity-60"
      >
        {pending ? copy.pending : copy.submit}
      </button>

      <p className="text-sm text-text-muted">
        {copy.altPrompt}{' '}
        <Link
          href={
            destination === DEFAULT_AFTER_SIGN_IN
              ? copy.altHref
              : `${copy.altHref}?next=${encodeURIComponent(destination)}`
          }
          className="text-text-primary underline"
        >
          {copy.altLabel}
        </Link>
      </p>
    </form>
  );
}
