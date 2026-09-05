/**
 * Database Schema - Single Source of Truth
 *
 * All tables defined with Drizzle ORM for PostgreSQL.
 * Types are automatically derived from schema (never define separately).
 *
 * Table names carry a `fundraising_` prefix because these tables once shared a
 * database with another application's. They no longer do — hirnli has its own
 * database — but the prefix stays: renaming 9 tables to tidy a name is churn
 * with a migration's risk and none of its value.
 *
 * Schema serves Ground Truth #2: State defines behavior, one source of truth.
 */

import {
  text,
  integer,
  boolean,
  jsonb,
  pgTable,
  primaryKey,
  timestamp,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import type { ApplicationStatusId } from '@/lib/config/application-statuses';

/**
 * Foundations — the shared registry of who exists.
 *
 * One row per foundation, for every tenant together: the primary key is the
 * slug alone, so this table has only ever been able to hold one row per
 * foundation. The `orgId` column below reads like tenancy but cannot provide
 * it — a second organisation assessing the same foundation would collide on
 * the primary key.
 *
 * So the per-organisation opinion lives in `foundationAssessments`, and what
 * belongs here is what is true regardless of who is asking: name, purpose,
 * address, deadlines, amounts, and the Schmuki type (which classifies the
 * foundation, not the relationship to it).
 *
 * The split is complete as of migration 0015. `configData` held the assessment
 * fields too — 0012 copied them out without removing them — and four of them
 * also existed as flat columns here. Each value therefore lived in three
 * places, two of which were per-organisation data on a table every tenant
 * shares, so no single value could be right for more than one customer.
 * 0015 deleted both copies; the assessment row is now the only home.
 */
export const foundations = pgTable(
  'fundraising_foundations',
  {
    // Primary key - kebab-case slug (e.g., 'volkart-stiftung')
    id: text('id').primaryKey(),

    // Basic information
    name: text('name').notNull(),

    // fit_score, priority, research_depth and research_date used to sit here,
    // kept in step with config_data by the 0003 trigger. Migration 0015 dropped
    // them: they describe what one organisation makes of a foundation, and this
    // table is shared by every organisation, so no single value could be
    // correct once there was more than one customer. They live in
    // `foundationAssessments` below, one row per org per foundation.

    // Data confidence tracking — a property of the registry entry itself (how
    // well sourced it is), not of anybody's opinion of it, so it stays here.
    dataConfidence: text('data_confidence'), // 'unverified' | 'ai-assessed' | 'human-verified'

    // Full config object (Zod Foundation schema shape). Parsed through
    // foundationSchema on every read; a row that fails to parse is dropped.
    //
    // This used to say the DB was a write SSOT feeding a generated TypeScript
    // config that acted as a build cache. That has not been true since 9323d69
    // deleted both the sync script and stiftungen-generated.ts — every read now
    // hits the database at runtime. Docs elsewhere still describe the old
    // arrangement and are wrong.
    configData: jsonb('config_data'),

    // Whose row this is. NOT NULL as of migration 0013, which is what makes
    // Drizzle infer it as required: an insert that omits the tenant now fails
    // to compile rather than writing a row belonging to nobody. Both admin
    // write paths did exactly that once the 0011 default was dropped.
    //
    // Temporary. When readers move to foundationAssessments this table is the
    // shared registry, ownership lives in the assessment row, and this column
    // is dropped.
    orgId: text('org_id').notNull(),

    // Admin
    source: text('source'), // swissfoundations, spheriq, zhaw, typescript-legacy, rapid-assessment, etc.
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    archived: boolean('archived').default(false),
  },
  (table) => ({
    // Reads filter by `archived = false AND data_confidence != 'unverified'` on
    // every request. These indexes turn the 16k-row scan into millisecond
    // lookups as the table grows.
    //
    // The priority index went with the priority column in 0015 — ranking is
    // per-organisation now and is served by fund_assessments_org_rank_idx on
    // the assessments table.
    byOrgArchived: index('fund_foundations_org_archived_idx').on(table.orgId, table.archived),
    byConfidence: index('fund_foundations_data_confidence_idx').on(table.dataConfidence),
  }),
);

/**
 * Applications Table - Track all outreach
 *
 * Manages the full lifecycle from prospect to accepted/rejected.
 * Each application links to a foundation and tracks status, timeline, outcomes.
 */
export const applications = pgTable(
  'fundraising_applications',
  {
    id: text('id').primaryKey(),
    foundationId: text('foundation_id')
      .notNull()
      .references(() => foundations.id),

    // Status tracking (Kanban board columns)
    status: text('status').notNull().$type<ApplicationStatusId>(), // type narrowed from config SSOT

    // Application details
    requestedAmount: integer('requested_amount'), // CHF
    projectFocus: text('project_focus'), // Which Revamp-IT program (Werkstatt Ausbau, etc.)
    customizationNotes: text('customization_notes'), // Notes on how Gesuch was personalized

    // Timeline
    contactDate: text('contact_date'), // ISO date - when first contacted
    submissionDate: text('submission_date'), // ISO date - when submitted
    decisionExpected: text('decision_expected'), // ISO date - expected decision date
    decisionDate: text('decision_date'), // ISO date - actual decision date

    // Outcomes
    awardedAmount: integer('awarded_amount'), // CHF - actual amount received
    fundingPeriod: text('funding_period'), // e.g., '2026-2028'
    successFactors: text('success_factors'), // What worked - learning for future
    rejectionReason: text('rejection_reason'), // Why declined - learning for future

    // Documents
    gesuchVersion: text('gesuch_version'), // Which template/version was used
    documentsSent: text('documents_sent'), // JSON array of document references

    // Management
    assignedTo: text('assigned_to'), // Team member responsible
    priorityLevel: integer('priority_level'), // 1-4 (1 = highest)

    // Multi-org support — applications belong to the org that filed them
    orgId: text('org_id').notNull(),

    // Admin
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    // The Kanban + dashboard queries filter by status and join by foundation_id;
    // the application-detail route reads by id (already PK).
    byFoundation: index('fund_applications_foundation_idx').on(table.foundationId),
    byStatus: index('fund_applications_status_idx').on(table.status),
    byOrg: index('fund_applications_org_idx').on(table.orgId),
  }),
);

/**
 * Customization Rules Table - Personalization engine
 *
 * Rules define how to customize Gesuch documents for specific foundations.
 * Condition → Action pattern allows flexible personalization at scale.
 */
export const customizationRules = pgTable(
  'fundraising_customization_rules',
  {
    id: text('id').primaryKey(),
    foundationId: text('foundation_id').references(() => foundations.id), // NULL = global rule

    // Condition (when to apply this rule)
    conditionType: text('condition_type').notNull(), // focus_match | grant_size | geographic | organization_type | custom
    conditionValue: text('condition_value').notNull(), // Value to match (e.g., 'circular economy', '<50000')

    // Action (what to do when condition matches)
    actionType: text('action_type').notNull(), // emphasize_narrative | show_budget_module | hide_budget_module | adjust_tone | add_section | reorder_sections | custom
    actionValue: text('action_value').notNull(), // Action-specific data (JSON for complex actions)

    // Metadata
    rationale: text('rationale'), // Why this rule exists (human-readable explanation)
    priority: integer('priority').default(50), // Higher = applied first
    active: boolean('active').default(true),

    // Multi-org support — rules are authored per org
    orgId: text('org_id').notNull(),

    // Admin
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    byOrg: index('fund_customization_rules_org_idx').on(table.orgId),
  }),
);

/**
 * Activity Log Table - Full audit trail
 *
 * Immutable log of all actions taken on foundations and applications.
 * Enables full history tracking and accountability.
 */
export const activityLog = pgTable(
  'fundraising_activity_log',
  {
    id: text('id').primaryKey(),

    // What was modified
    entityType: text('entity_type').notNull(), // 'foundation' | 'application'
    entityId: text('entity_id').notNull(), // ID of the modified entity

    // What happened
    actionType: text('action_type').notNull(), // created | updated | status_changed | document_generated | etc.
    actionDetails: text('action_details'), // JSON with action-specific data

    // Who did it
    performedBy: text('performed_by'), // User/system identifier

    // Multi-org support — every audit entry is scoped to the acting org
    orgId: text('org_id').notNull(),

    // When
    timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    // OverrideHistory + ActivityTimeline filter by (entityId, entityType) and
    // order by timestamp DESC. The composite covers the WHERE and the ORDER BY.
    byEntity: index('fund_activity_log_entity_idx').on(
      table.entityType,
      table.entityId,
      table.timestamp,
    ),
    byOrg: index('fund_activity_log_org_idx').on(table.orgId),
  }),
);

/**
 * Gesuch Overrides Table - Per-foundation × per-variant content customizations
 *
 * Stores manual edits and AI-assisted rewrites of gesuch sections.
 * Overrides are merged on top of composed gesuch content at render time.
 * Each (foundationId, orgId, variantKey) triple has its own set of overrides.
 * JSONB structure: { foundationBridge?, why?, how?, anschreiben? }
 */
export const gesuchOverrides = pgTable(
  'fundraising_gesuch_overrides',
  {
    id: text('id').primaryKey(),
    foundationId: text('foundation_id')
      .notNull()
      .references(() => foundations.id),
    orgId: text('org_id').notNull(),
    variantKey: text('variant_key').notNull().default('auto'), // 'auto' | schwerpunkt ID
    overrides: jsonb('overrides').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    // Lookups + concurrent-write safety: ON CONFLICT in PUT/PATCH targets this.
    // Without this, two concurrent saves can both see "no existing row" and create duplicates.
    uniqueByFoundationOrgVariant: unique('gesuch_overrides_unique_foundation_org_variant').on(
      table.foundationId,
      table.orgId,
      table.variantKey,
    ),
  }),
);

export type GesuchOverride = typeof gesuchOverrides.$inferSelect;
export type NewGesuchOverride = typeof gesuchOverrides.$inferInsert;

/** Typed shape of the overrides JSONB — Zod schema is SSOT */
export type { GesuchOverridesData } from '../schemas/gesuch-overrides';

/**
 * Type Exports - Derived from schema (never define separately)
 *
 * Following Ground Truth #2: Schema is SSOT, types are derived.
 */
export type FoundationRow = typeof foundations.$inferSelect;

/**
 * A registry row with one organisation's assessment folded in.
 *
 * What a list or card actually needs: the foundation's own facts, plus how the
 * viewing organisation rates it. Fit and priority used to be columns on
 * FoundationRow, so components read them straight off it; migration 0015 moved
 * them to the assessment table, and this type keeps the shape those components
 * expect while making it explicit that the two halves have different owners.
 *
 * Null means this organisation has not assessed the foundation — not that the
 * foundation is unrated. Another tenant may well have scored it.
 */
export type FoundationRowWithAssessment = FoundationRow & {
  fitScore: number | null;
  priority: number | null;
};
export type NewFoundationRow = typeof foundations.$inferInsert;

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
/**
 * What `GET /api/applications` returns: an application beside the foundation it
 * targets, rated as the requesting organisation rates it.
 */
export type ApplicationWithFoundation = {
  application: Application;
  foundation: FoundationRowWithAssessment | null;
};

export type CustomizationRule = typeof customizationRules.$inferSelect;
export type NewCustomizationRule = typeof customizationRules.$inferInsert;

export type ActivityLogEntry = typeof activityLog.$inferSelect;
export type NewActivityLogEntry = typeof activityLog.$inferInsert;
/** JSON-serialized shape returned by GET /api/activity-log (timestamp is a string, not Date) */
export type ActivityLogEntryJSON = Omit<ActivityLogEntry, 'timestamp'> & { timestamp: string };

// ─── Tenant identity ─────────────────────────────────────────────────────────
//
// Created by migration 0007 but never declared here, so nothing could read it
// in a typed way — which is part of why org identity stayed a compile-time
// constant. This row is the SSOT for who a tenant is; see
// src/lib/tenant/profile.ts for the shape and src/lib/tenant/resolve.ts for the
// single reader.

export const orgProfiles = pgTable('org_profiles', {
  orgId: text('org_id').primaryKey(),
  /** Validated against storedTenantProfileSchema on read — facts only, no derived values. */
  profile: jsonb('profile').notNull().default({}),
  /** Per-tenant design tokens (colours, logo). Consumed by the tenant chrome. */
  branding: jsonb('branding').notNull().default({}),
  defaultLocale: text('default_locale').notNull().default('de'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type OrgProfileRow = typeof orgProfiles.$inferSelect;

/**
 * What one organisation SAYS — its stories, metrics, templates, Schwerpunkte.
 *
 * The table has existed since migration 0007 and has been seeded since, but was
 * never declared here, so nothing in the app could read it: the content was
 * mirrored into the database and then imported from TypeScript anyway. Declared
 * now because `src/lib/content/read.ts` is the reader that ends that.
 *
 * Keyed (org_id, key, locale). `value` is jsonb and therefore shapeless, which
 * is why every read validates against the block's Zod schema rather than
 * casting — see the reader.
 */
export const orgContent = pgTable(
  'org_content',
  {
    orgId: text('org_id').notNull(),
    /** Block name, e.g. 'stories', 'numbers', 'schwerpunkte'. */
    key: text('key').notNull(),
    locale: text('locale').notNull().default('de'),
    value: jsonb('value').notNull(),
    version: integer('version').notNull().default(1),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.key, table.locale] }),
    byOrg: index('org_content_org_idx').on(table.orgId),
  }),
);

export type OrgContentRow = typeof orgContent.$inferSelect;

/**
 * How one organisation SCORES foundations — its fit and readiness engines.
 *
 * Declarative config that varies per tenant: what makes a foundation a good
 * match is a judgement each organisation makes for itself.
 *
 * Declared here for the same reason as `orgContent`: `drizzle.config.ts` points
 * drizzle-kit at this file as the source of truth for the whole database, so a
 * table that exists in Postgres but not here is one `pnpm db:push` offers to
 * DROP. Both tables have existed since migration 0007 and hold seeded content.
 */
export const orgScoring = pgTable('org_scoring', {
  orgId: text('org_id').primaryKey(),
  engine: jsonb('engine').notNull(),
  readiness: jsonb('readiness').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type OrgScoringRow = typeof orgScoring.$inferSelect;

/**
 * What one organisation thinks of one foundation.
 *
 * The counterpart to the registry: `foundations` says who exists, this says
 * how they rate for a given tenant. Keyed (orgId, foundationId), so two
 * organisations can assess the same foundation without touching each other's
 * rows — the thing the single-slug primary key on `foundations` makes
 * impossible today.
 *
 * The separation is also a confidentiality boundary. `researchNotes` holds
 * sentences like "Relevante Übereinstimmung mit Revamp-IT-Themen (Fit 2/3)":
 * which funders a fundraiser rates highly, and what they have learned about
 * them, is precisely what they do not show another fundraiser on the same
 * platform. A shared blob cannot express that; two tables can.
 *
 * Note what is absent: there is no `configData` here. In `foundations`,
 * fitScore/priority/researchDate/researchDepth live twice — in the blob and as
 * flat columns — kept in step by the trigger added in migration 0003, after
 * 535 rows had already drifted apart in production. Here each value exists
 * once, as a column. The trigger has nothing to do because there is no second
 * copy to reconcile.
 */
export const foundationAssessments = pgTable(
  'fundraising_foundation_assessments',
  {
    orgId: text('org_id')
      .notNull()
      .references(() => orgProfiles.orgId, { onDelete: 'cascade' }),
    foundationId: text('foundation_id')
      .notNull()
      .references(() => foundations.id, { onDelete: 'cascade' }),

    /** 0-10. NOT NULL because all 16,623 migrated rows had one; a nullable score invites an invented default. */
    fitScore: integer('fit_score').notNull().default(0),
    /** 1 (highest) to 4. Likewise present on every migrated row. */
    priority: integer('priority').notNull().default(4),
    /** When true the stored priority wins over the computed one (see foundation-scores.ts). */
    priorityOverride: boolean('priority_override').notNull().default(false),

    /**
     * Which of THIS organisation's themes the foundation matches.
     *
     * Stored rather than constrained to an enum on purpose. The current values
     * are Revamp-IT's seven mission areas, and a second tenant's would be
     * different — a theme vocabulary is one tenant's description of its own
     * work, so it is data. `ThemeId` in schemas/foundation.ts is still a code
     * enum, which is the next thing this argument applies to.
     */
    themes: jsonb('themes').notNull().default([]),

    tagline: text('tagline'),
    researchNotes: text('research_notes'),

    /** When this organisation last assessed the foundation. Registry freshness is foundations.updatedAt. */
    researchDate: text('research_date'),
    researchDepth: text('research_depth'),

    possiblePartners: jsonb('possible_partners'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.orgId, table.foundationId] }),
    // The list view sorts one tenant's foundations by priority, then fit.
    byOrgRank: index('fund_assessments_org_rank_idx').on(
      table.orgId,
      table.priority,
      table.fitScore,
    ),
  }),
);

export type FoundationAssessmentRow = typeof foundationAssessments.$inferSelect;
export type NewFoundationAssessment = typeof foundationAssessments.$inferInsert;

/**
 * Host → tenant. The routing table, as data.
 *
 * Replaces `HOST_TENANTS` in `src/lib/config/../tenant/registry.ts`, which was
 * an object literal: taking on a customer required a deploy. Middleware cannot
 * read this (Edge runtime), so it forwards the Host and `getCurrentOrgId()`
 * resolves here.
 */
export const orgDomains = pgTable(
  'org_domains',
  {
    host: text('host').primaryKey(),
    orgId: text('org_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    byOrg: index('org_domains_org_idx').on(table.orgId),
  }),
);

export type OrgDomainRow = typeof orgDomains.$inferSelect;
