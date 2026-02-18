/**
 * Database Schema - Single Source of Truth
 *
 * All tables defined with Drizzle ORM for PostgreSQL (Neon).
 * Types are automatically derived from schema (never define separately).
 *
 * Table names prefixed with `fundraising_` to avoid conflicts with
 * revampit's existing tables in the shared Neon database.
 *
 * Schema serves Ground Truth #2: State defines behavior, one source of truth.
 */

import { sql } from 'drizzle-orm';
import { text, integer, boolean, jsonb, pgTable } from 'drizzle-orm/pg-core';

/**
 * Foundations Table - SSOT for all foundation data
 *
 * Stores 267+ foundations from TypeScript config + research JSON files.
 * This is the primary entity for the fundraising intelligence platform.
 */
export const foundations = pgTable('fundraising_foundations', {
  // Primary key - kebab-case slug (e.g., 'volkart-stiftung')
  id: text('id').primaryKey(),

  // Basic information
  name: text('name').notNull(),
  websiteUrl: text('website_url'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),

  // Classification
  fitScore: integer('fit_score'), // 0-10 scale
  priority: integer('priority'), // 1-4 (1 = highest)
  focusAreas: text('focus_areas'), // JSON array of strings
  geographicScope: text('geographic_scope'), // e.g., 'Switzerland', 'Zurich', 'International'
  organizationType: text('organization_type'), // foundation, fund, program, network

  // Funding details
  grantRangeMin: integer('grant_range_min'), // CHF
  grantRangeMax: integer('grant_range_max'), // CHF
  typicalAmount: integer('typical_amount'), // CHF
  fundingModel: text('funding_model'), // project, institutional, multi-year
  applicationMethod: text('application_method'), // online, email, invitation-only
  applicationDeadline: text('application_deadline'), // ISO date or 'rolling'
  decisionTimeline: text('decision_timeline'), // e.g., '3-6 months'

  // Strategic data
  strategicFit: text('strategic_fit'), // Markdown explanation
  applicationNotes: text('application_notes'), // Markdown
  pastGrantees: text('past_grantees'), // JSON array
  boardMembers: text('board_members'), // JSON array

  // Research metadata
  researchDepth: text('research_depth'), // 'rapid' | 'standard' | 'deep'
  researchDate: text('research_date'), // ISO date
  researchFilePath: text('research_file_path'), // Path to original /research/*.md file
  dataQuality: integer('data_quality'), // 1-5 scale

  // Full config object (Zod Foundation schema shape) — used by sync script
  // to generate TypeScript config. DB is write SSOT, generated TS is build cache.
  configData: jsonb('config_data'),

  // Admin
  source: text('source'), // swissfoundations, spheriq, zhaw, typescript-legacy, rapid-assessment, etc.
  createdAt: text('created_at').default(sql`now()`),
  updatedAt: text('updated_at').default(sql`now()`),
  archived: boolean('archived').default(false),
});

/**
 * Applications Table - Track all outreach
 *
 * Manages the full lifecycle from prospect to accepted/rejected.
 * Each application links to a foundation and tracks status, timeline, outcomes.
 */
export const applications = pgTable('fundraising_applications', {
  id: text('id').primaryKey(),
  foundationId: text('foundation_id').notNull().references(() => foundations.id),

  // Status tracking (Kanban board columns)
  status: text('status').notNull(), // prospect | research | draft | review | submitted | pending | followup | accepted | rejected | withdrawn | onhold

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

  // Admin
  createdAt: text('created_at').default(sql`now()`),
  updatedAt: text('updated_at').default(sql`now()`),
});

/**
 * Customization Rules Table - Personalization engine
 *
 * Rules define how to customize Gesuch documents for specific foundations.
 * Condition → Action pattern allows flexible personalization at scale.
 */
export const customizationRules = pgTable('fundraising_customization_rules', {
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

  // Admin
  createdAt: text('created_at').default(sql`now()`),
});

/**
 * Activity Log Table - Full audit trail
 *
 * Immutable log of all actions taken on foundations and applications.
 * Enables full history tracking and accountability.
 */
export const activityLog = pgTable('fundraising_activity_log', {
  id: text('id').primaryKey(),

  // What was modified
  entityType: text('entity_type').notNull(), // 'foundation' | 'application'
  entityId: text('entity_id').notNull(), // ID of the modified entity

  // What happened
  actionType: text('action_type').notNull(), // created | updated | status_changed | document_generated | etc.
  actionDetails: text('action_details'), // JSON with action-specific data

  // Who did it
  performedBy: text('performed_by'), // User/system identifier

  // When
  timestamp: text('timestamp').default(sql`now()`),
});

/**
 * Contacts Table - Email/phone validation + communication history
 *
 * Manages contact information for foundations with validation status.
 * Supports multiple contacts per foundation.
 */
export const contacts = pgTable('fundraising_contacts', {
  id: text('id').primaryKey(),
  foundationId: text('foundation_id').notNull().references(() => foundations.id),

  // Contact information
  contactType: text('contact_type'), // email | phone | linkedin | meeting
  contactValue: text('contact_value').notNull(), // Actual email/phone/URL
  contactName: text('contact_name'), // Person's name
  contactRole: text('contact_role'), // Their role at foundation

  // Validation
  validated: boolean('validated').default(false),
  validationDate: text('validation_date'), // ISO date
  isPrimary: boolean('is_primary').default(false), // Primary contact for foundation

  // Notes
  notes: text('notes'), // Communication history, preferences, etc.

  // Admin
  createdAt: text('created_at').default(sql`now()`),
});

/**
 * Type Exports - Derived from schema (never define separately)
 *
 * Following Ground Truth #2: Schema is SSOT, types are derived.
 */
export type Foundation = typeof foundations.$inferSelect;
export type NewFoundation = typeof foundations.$inferInsert;

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;

export type CustomizationRule = typeof customizationRules.$inferSelect;
export type NewCustomizationRule = typeof customizationRules.$inferInsert;

export type ActivityLogEntry = typeof activityLog.$inferSelect;
export type NewActivityLogEntry = typeof activityLog.$inferInsert;

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
