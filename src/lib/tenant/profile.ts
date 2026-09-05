/**
 * Tenant identity — the shape, and what is derived rather than stored.
 *
 * Hirnli is a platform; a tenant is a customer that fundraises with it. There
 * will be many, on both sides of the market, so identity cannot live in code:
 * one TypeScript constant per organisation is N sources of truth and a switch
 * statement waiting to happen.
 *
 * ── SSOT, split cleanly in two ───────────────────────────────────────────────
 *   VALUES  live in `org_profiles.profile` — one row per tenant, the database
 *           is authoritative.
 *   SHAPE   lives in the schema below, and every type is DERIVED from it via
 *           z.infer. A hand-written interface beside a schema is the same
 *           duplication one level up.
 *
 * ── Never store what you can derive ──────────────────────────────────────────
 * The seeded revamp-it row carried `yearsActive: 23` and
 * `experienceLabel: "über 23 Jahren Erfahrung"` alongside `founded: 2003`.
 * Those are not facts, they are arithmetic on a fact — and they agreed with the
 * code only because the year happened to be 2026. On 1 January the stored value
 * says 23 while the computed one says 24, and nothing fails loudly: some pages
 * read the row, others the constant, and an organisation's own age becomes
 * inconsistent across its Gesuch documents.
 *
 * So `StoredTenantProfile` deliberately has no room for them, and `deriveTenant`
 * computes them on read. The schema is `.strict()` so re-seeding a derived value
 * is a validation error rather than a slow divergence.
 */

import { z } from 'zod';

/** A dated milestone, e.g. when an integration programme began. */
const milestonesSchema = z.record(z.string(), z.number().int()).optional();

const missionAreaSchema = z.object({
  name: z.string(),
  description: z.string(),
  metrics: z.array(z.string()),
});

/**
 * What is PERSISTED for a tenant. Facts only.
 *
 * `.strict()` matters: it rejects `yearsActive` and any other computed value
 * someone re-adds later, which is the only mechanism that actually keeps a
 * derivation from being frozen into the row again.
 */
export const storedTenantProfileSchema = z
  .object({
    /** Must equal the row's org_id AND the org_id scoping this tenant's data. */
    orgId: z.string().min(1),
    name: z.string().min(1),
    legalForm: z.string().min(1),
    /** The fact. `yearsActive` is arithmetic on this and is never stored. */
    founded: z.number().int().min(1800).max(2200),
    location: z.string().min(1),
    /** Public site. A tenant may have none yet. */
    website: z.string().url().optional(),
    /** Where this tenant's Hirnli-hosted pages live. */
    siteUrl: z.string().url().optional(),
    email: z.string().email(),

    // Optional — absent for a young organisation, and absence must render as
    // "not stated" rather than an invented value.
    address: z.string().optional(),
    warehouseAddress: z.string().optional(),
    cloudUrl: z.string().url().optional(),
    phone: z.string().optional(),
    contactName: z.string().optional(),
    fundraisingEmail: z.string().email().optional(),
    taxExemption: z.string().optional(),
    milestones: milestonesSchema,

    /**
     * One sentence the organisation would lead with. Rendered as the homepage
     * hero paragraph.
     *
     * Separate from `missionSummary` because they are different grammatical
     * objects and only one of them is a sentence. `missionSummary` is a
     * genitive phrase built to sit mid-clause — "…mit Fokus auf
     * Kreislaufwirtschaft, Arbeitsintegration und digitaler Bildung" — and
     * printing it alone under a heading reads as a fragment. That is exactly
     * what happened when the hero first started reading from the profile.
     *
     * Optional: a tenant without one falls back to `missionSummary`, which is
     * a fragment but is at least its own.
     */
    tagline: z.string().optional(),

    // Positioning. NOTE: this is org CONTENT rather than identity, and its
    // natural home is `org_content` beside stories/schwerpunkte/themes — which
    // already holds exactly this kind of row. Left here for now because moving
    // it touches every consumer; doing it half-way would create the second
    // source of truth this file exists to prevent. Tracked as the next step.
    missionSummary: z.string().optional(),
    missionKeywords: z.array(z.string()).optional(),
    missionAreas: z.array(missionAreaSchema).optional(),
  })
  .strict();

export type StoredTenantProfile = z.infer<typeof storedTenantProfileSchema>;

/**
 * How a tenant LOOKS. Data, for the same reason its name is data.
 *
 * `branding.ts` used to hold `logo.main: '/revampit-icon.png'` — one customer's
 * logo, hardcoded, in a file whose own header claimed to be the SSOT for visual
 * identity. Every tenant therefore rendered under Revamp-IT's mark, which is
 * how evig's pages came to carry another organisation's logo.
 *
 * `logoUrl` is a URL rather than a bundled asset on purpose: a platform cannot
 * require a customer to open a pull request to change their logo. Relative
 * paths still work for assets the platform happens to host today.
 */
export const tenantBrandingSchema = z
  .object({
    logoUrl: z.string().min(1).optional(),
    logoAlt: z.string().optional(),
    /** Accent used by the tenant chrome, injected as a CSS custom property. */
    primaryColor: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, 'expected a #rrggbb hex colour')
      .optional(),
  })
  .strict();

export type TenantBranding = z.infer<typeof tenantBrandingSchema>;

/** Branding falls back to nothing, never to another tenant's mark. */
export function parseBranding(branding: unknown): TenantBranding {
  const parsed = tenantBrandingSchema.safeParse(branding ?? {});
  return parsed.success ? parsed.data : {};
}

/** A tenant as the app consumes it: stored facts plus what follows from them. */
export type Tenant = StoredTenantProfile & {
  /** Whole years since founding, as of now. */
  yearsActive: number;
  /**
   * Dative form ("Jahren") — it is interpolated after "mit" / "Als <X> mit" in
   * the bridge composer, the Anschreiben composer and the stories opening, so
   * the case is load-bearing rather than stylistic.
   */
  experienceLabel: string;
};

/**
 * Add the derived fields. `now` is injectable so tests can pin the year — the
 * whole point of this function is that its output changes with time, which is
 * untestable against a real clock.
 */
export function deriveTenant(stored: StoredTenantProfile, now: Date = new Date()): Tenant {
  const yearsActive = Math.max(0, now.getFullYear() - stored.founded);
  return {
    ...stored,
    yearsActive,
    experienceLabel: experienceLabelFor(yearsActive),
  };
}

/**
 * The experience phrase, in the dative — it is interpolated after "mit" /
 * "Als <X> mit", so the case is grammar, not style.
 *
 * The single template `über ${n} Jahren Erfahrung` was written for one
 * twenty-three-year-old organisation and breaks for the tenants after it: a
 * founded-this-year org reads "über 0 Jahren Erfahrung", and a one-year-old
 * reads "über 1 Jahren" — the dative singular is "einem Jahr". Both would go
 * out in a real Gesuch to a foundation, which is the worst place to be
 * ungrammatical about yourself.
 */
function experienceLabelFor(yearsActive: number): string {
  if (yearsActive <= 0) return 'seit diesem Jahr';
  if (yearsActive === 1) return 'über einem Jahr Erfahrung';
  return `über ${yearsActive} Jahren Erfahrung`;
}

/** Parse a row's `profile` JSONB into a tenant, deriving the computed fields. */
export function parseTenant(profile: unknown, now?: Date): Tenant {
  return deriveTenant(storedTenantProfileSchema.parse(profile), now);
}
