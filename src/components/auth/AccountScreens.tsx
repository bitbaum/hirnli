'use client';

/**
 * The fleet's account screens (@bitbaum/accountkit/auth/react) in Hirnli's
 * look: every way in on one screen (passkey, email and password, a sign-in
 * link by email, "Weiter mit OrangeCat", the shared sign-in), password
 * recovery, and the account page with passkeys and a second factor. The logic
 * and the words are the package's, the same in every product; which options
 * show is decided on the server from the env (signInMethods).
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  AccountPanel,
  SignInForm,
  SignUpForm,
  type AuthClasses,
  type AuthLabels,
} from '@bitbaum/accountkit/auth/react';
import type { SignInMethods } from '@bitbaum/accountkit/auth';
import { authClient } from '@/lib/auth/client';

const CLASSES: Partial<AuthClasses> = {
  stack: 'flex flex-col gap-4',
  field: 'flex flex-col gap-1.5',
  label: 'text-sm font-medium text-text-secondary',
  hint: 'text-sm leading-relaxed text-text-muted',
  input:
    'min-h-11 w-full rounded-lg border border-border-default bg-surface-base px-3 text-text-primary',
  button:
    'inline-flex min-h-11 items-center justify-center rounded-lg bg-text-primary px-4 font-medium text-surface-base disabled:opacity-60',
  buttonQuiet:
    'inline-flex min-h-11 items-center justify-center rounded-lg border border-border-default bg-surface-base px-4 font-medium text-text-primary disabled:opacity-60',
  notice:
    'rounded-lg border border-border-default bg-surface-raised px-4 py-3 text-sm text-text-primary',
  error:
    'rounded-lg border border-border-default bg-surface-raised px-4 py-3 text-sm text-text-primary',
  divider:
    'flex items-center gap-3 text-sm text-text-muted before:h-px before:flex-1 before:bg-border-default after:h-px after:flex-1 after:bg-border-default',
  section: 'flex flex-col gap-4 border-t border-border-default pt-8',
  sectionTitle: 'text-lg font-semibold text-text-primary',
  link: 'break-all text-text-primary underline',
  check: 'flex min-h-11 items-center gap-3 text-sm text-text-secondary',
};

const textLink = 'text-text-primary underline';

export function HirnliSignIn(props: {
  labels: AuthLabels;
  methods: SignInMethods;
  next: string;
  signUpHref: string;
  initialError: boolean;
}) {
  return (
    <SignInForm
      client={authClient}
      classes={CLASSES}
      labels={props.labels}
      methods={props.methods}
      next={props.next}
      signInPath="/anmelden"
      initialError={props.initialError}
      signUpLink={
        <Link prefetch={false} href={props.signUpHref} className={textLink}>
          {props.labels.createAccount}
        </Link>
      }
    />
  );
}

export function HirnliSignUp(props: {
  labels: AuthLabels;
  methods: SignInMethods;
  next: string;
  signInHref: string;
}) {
  return (
    <SignUpForm
      client={authClient}
      classes={CLASSES}
      labels={props.labels}
      methods={props.methods}
      next={props.next}
      signUpPath="/registrieren"
      signInPath="/anmelden"
      signInLink={
        <Link prefetch={false} href={props.signInHref} className={textLink}>
          {props.labels.signIn}
        </Link>
      }
    />
  );
}

export function HirnliAccount(props: {
  labels: AuthLabels;
  methods: SignInMethods;
  user: {
    name: string;
    email: string | null;
    emailVerified: boolean;
    role: string;
    twoFactorEnabled: boolean;
  };
  linked: string[];
}) {
  return (
    <div className="flex flex-col gap-8">
      {props.user.email && !props.user.emailVerified && props.methods.passwordReset && (
        <Confirm email={props.user.email} labels={props.labels} />
      )}
      <AccountPanel
        client={authClient}
        classes={CLASSES}
        accountPath="/konto"
        homePath="/plattform"
        {...props}
      />
    </div>
  );
}

/**
 * Accounts made while Hirnli sent no mail are unconfirmed. Confirming is never
 * a wall here (confirmation comes after sign-in), so this only offers
 * AccountKit's resend: one link to the address on file.
 */
function Confirm({ email, labels }: { email: string; labels: AuthLabels }) {
  const [state, setState] = useState<'idle' | 'busy' | 'sent' | 'failed'>('idle');
  async function send() {
    setState('busy');
    const result = await authClient
      .sendVerificationEmail({ email, callbackURL: '/konto' })
      .catch(() => ({ error: true }));
    setState(result?.error ? 'failed' : 'sent');
  }
  return (
    <div className={CLASSES.notice}>
      <p className="mb-3">
        {labels.email}: {email} ({labels.account.unverified})
      </p>
      {state === 'sent' ? (
        <p role="status">{labels.confirmInbox.replace('{email}', email)}</p>
      ) : (
        <button
          type="button"
          className={CLASSES.buttonQuiet}
          disabled={state === 'busy'}
          onClick={send}
        >
          {labels.resendVerification}
        </button>
      )}
      {state === 'failed' && <p role="alert">{labels.errors.generic}</p>}
    </div>
  );
}
