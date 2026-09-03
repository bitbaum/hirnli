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

/** Better Auth's minPasswordLength. Stated up front, not discovered on submit. */
const MIN_PASSWORD = 12;

export function AuthForm({ mode }: { mode: Mode }) {
  const copy = COPY[mode];
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

    // Where to land is decided server-side by how many organisations this
    // person belongs to, so send them through the router rather than guessing.
    router.push('/start');
    router.refresh();
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
          minLength={mode === 'signup' ? MIN_PASSWORD : undefined}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="min-h-11 rounded-lg border border-border-default bg-surface-base px-3 text-text-primary"
        />
        {mode === 'signup' && (
          <span className="text-xs text-text-muted">Mindestens {MIN_PASSWORD} Zeichen.</span>
        )}
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
        <Link href={copy.altHref} className="text-text-primary underline">
          {copy.altLabel}
        </Link>
      </p>
    </form>
  );
}
