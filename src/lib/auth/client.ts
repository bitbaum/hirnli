/**
 * Browser-side auth client. Used by the sign-in/sign-up forms and the org
 * switcher; server components should use `@/lib/auth/access` instead.
 */

import { createAuthClient } from 'better-auth/react';
import { organizationClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [organizationClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
