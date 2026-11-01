'use client';

/**
 * Browser-side auth client. Used by the account screens and the org switcher;
 * server components should use `@/lib/auth/access` instead.
 *
 * AccountKit's plugins (passkey, second factor, sign-in link) plus the
 * organisation plugin the workspaces run on.
 */

import { createAuthClient } from 'better-auth/react';
import { organizationClient } from 'better-auth/client/plugins';
import { authClientPlugins } from '@bitbaum/accountkit/auth/client';

export const authClient = createAuthClient({
  plugins: [...authClientPlugins(), organizationClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
