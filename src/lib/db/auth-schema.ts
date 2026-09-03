/**
 * Identity schema — users, organisations, memberships, invitations.
 *
 * Hirnli is the platform; an organisation is a customer that fundraises with
 * it (revamp-it and evig are the first two, and there will be more). A person
 * has ONE account and may belong to several organisations — that is the whole
 * point of this file, and the reason identity could not simply be bolted onto
 * the single-tenant model that came before.
 *
 * ── Why these tables can use plain names ─────────────────────────────────────
 * They could not, until 2026-09-02. Hirnli's nine tables lived inside evig's
 * `revampit` database, where `users`, `accounts` and `sessions` already exist
 * and belong to evig's marketplace. Creating `users` there would have collided
 * — and an auth library pointed at the wrong `users` table authenticates real
 * people against the wrong application, which is the failure you least want to
 * discover in production. Hirnli now owns its own database, so these names are
 * free. A platform holding many customers' fundraising research also has no
 * business living inside one customer's application database.
 *
 * ── Shapes come from Better Auth ─────────────────────────────────────────────
 * Column names and types below match what Better Auth's core and `organization`
 * plugin expect. Drift here does not fail loudly at build time — it fails at
 * sign-in. Regenerate rather than hand-edit when upgrading the library.
 */

import { pgTable, text, timestamp, boolean, index, uniqueIndex } from 'drizzle-orm/pg-core';

// ── Core identity ────────────────────────────────────────────────────────────

export const user = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    /**
     * Better Auth's organisation plugin keeps a "currently active" org here.
     *
     * We store it, but it is a CONVENIENCE ONLY — the last org you used, so
     * `/` knows where to send you. It must never be the thing that authorises
     * a request. The acting organisation comes from the URL
     * (`/o/<slug>/…`), because a session-held active org cannot survive two
     * tabs: opening evig in a second tab would silently re-point the first,
     * and the next edit would land on the wrong customer's data. See
     * `requireOrgAccess()`.
     */
    activeOrganizationId: text('active_organization_id'),
  },
  (t) => [index('sessions_user_id_idx').on(t.userId)],
);

export const account = pgTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    /** bcrypt/scrypt hash for email+password sign-in. Never a plaintext secret. */
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index('accounts_user_id_idx').on(t.userId)],
);

export const verification = pgTable(
  'verifications',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index('verifications_identifier_idx').on(t.identifier)],
);

// ── Organisations and membership ─────────────────────────────────────────────

export const organization = pgTable('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  /**
   * URL segment AND the org-scoping key. This must equal the `org_id` used
   * across the fundraising tables (`revamp-it`, `evig`) — the same string is
   * what scopes every row of a customer's data, so a mismatch here is not a
   * cosmetic bug, it is one customer reading another's research.
   */
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const member = pgTable(
  'org_members',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    /** owner | admin | member — Better Auth's vocabulary, not ours. */
    role: text('role').default('member').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('org_members_org_id_idx').on(t.organizationId),
    index('org_members_user_id_idx').on(t.userId),
    // One membership row per person per org. Without this, a double-accepted
    // invitation yields two rows and role checks become order-dependent.
    uniqueIndex('org_members_org_user_uidx').on(t.organizationId, t.userId),
  ],
);

export const invitation = pgTable(
  'org_invitations',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role'),
    status: text('status').default('pending').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    inviterId: text('inviter_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (t) => [
    index('org_invitations_org_id_idx').on(t.organizationId),
    index('org_invitations_email_idx').on(t.email),
  ],
);

// ── Derived types (schema is the SSOT) ───────────────────────────────────────

export type User = typeof user.$inferSelect;
export type Organization = typeof organization.$inferSelect;
export type Member = typeof member.$inferSelect;
export type Invitation = typeof invitation.$inferSelect;

// Role vocabulary lives in src/lib/auth/roles.ts — it is policy, not schema,
// and keeping it importable without this module keeps it testable without a DB.
