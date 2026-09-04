/**
 * Filling a tenant's own facts into its content.
 *
 * ── WHY CONTENT CANNOT SIMPLY BE MOVED TO THE DATABASE ───────────────────────
 *
 * `stories.ts` interpolates the organisation into its prose at module load:
 *
 *     kurzportrait_subtitle: `Gemeinnütziger Verein seit ${ORG_PROFILE.founded} — …`
 *     opening: `… als gemeinnütziger Verein mit ${ORG_PROFILE.experienceLabel} …`
 *
 * Seeding that into `org_content` freezes one organisation's facts inside
 * another's prose. The row currently in production literally reads "über 23
 * Jahren Erfahrung" and "seit 2003" — so a second tenant reading it would send a
 * foundation a Gesuch claiming the first tenant's founding year and experience.
 *
 * Six of those interpolations are `yearsActive`, which is arithmetic on the
 * current date. A stored copy is right until 31 December and wrong on 1 January
 * — the exact drift `storedTenantProfileSchema` refuses to allow in a profile,
 * arriving through the back door in content instead.
 *
 * So content is stored as a TEMPLATE and the tenant fills it on read:
 *
 *     'Gemeinnütziger Verein seit {{founded}} — …'
 *
 * The values are derived per request from the tenant row, which means they
 * cannot be another organisation's and cannot be out of date.
 */

import type { Tenant } from '@/lib/tenant/profile';

/** `{{ founded }}` — whitespace tolerated, one dotted path per placeholder. */
const PLACEHOLDER = /\{\{\s*([a-zA-Z][a-zA-Z0-9_.]*)\s*\}\}/g;

/**
 * The facts a content template may refer to.
 *
 * Deliberately a fixed, flat map rather than "any path on the tenant": content
 * is edited by people, and a typo should be a loud error naming the options
 * rather than a silent empty string in a Gesuch. It also keeps the contract
 * visible — this is the whole vocabulary a content author has.
 */
export function templateValues(tenant: Tenant): Record<string, string | undefined> {
  return {
    name: tenant.name,
    legalForm: tenant.legalForm,
    location: tenant.location,
    founded: String(tenant.founded),
    yearsActive: String(tenant.yearsActive),
    experienceLabel: tenant.experienceLabel,
    email: tenant.email,
    website: tenant.website,
    address: tenant.address,
    warehouseAddress: tenant.warehouseAddress,
    phone: tenant.phone,
    contactName: tenant.contactName,
    taxExemption: tenant.taxExemption,
    missionSummary: tenant.missionSummary,
    'milestones.integrationProgram': numberOrUndefined(tenant.milestones?.integrationProgram),
    'milestones.kivitendoStart': numberOrUndefined(tenant.milestones?.kivitendoStart),
    'milestones.deviceTrackingStart': numberOrUndefined(tenant.milestones?.deviceTrackingStart),
  };
}

function numberOrUndefined(n: number | undefined): string | undefined {
  return n === undefined ? undefined : String(n);
}

/**
 * Replace every placeholder in one string.
 *
 * Throws on an unknown name, and on a known name the tenant has no value for.
 * Both are loud on purpose: the alternative is a Gesuch that reads "gegründet
 * undefined" or, worse, silently drops the clause. A tenant that lacks a fact
 * its content refers to has content that does not fit it yet, and that is worth
 * an error rather than a plausible-looking document.
 */
export function fillTemplate(text: string, values: Record<string, string | undefined>): string {
  return text.replace(PLACEHOLDER, (_match, key: string) => {
    if (!(key in values)) {
      throw new Error(
        `Unknown content placeholder "{{${key}}}". Available: ${Object.keys(values)
          .sort()
          .join(', ')}`,
      );
    }
    const value = values[key];
    if (value === undefined) {
      throw new Error(
        `Content uses "{{${key}}}", which this organisation has not set. ` +
          'Either give the tenant that fact, or write content that does not need it.',
      );
    }
    return value;
  });
}

/**
 * Fill every string in a content block, however deeply nested.
 *
 * Object keys are left alone — they are structure, not prose — and non-strings
 * pass through untouched, so numbers, booleans and nulls survive as themselves
 * rather than being stringified.
 */
export function fillContent<T>(value: T, tenant: Tenant): T {
  return fillDeep(value, templateValues(tenant)) as T;
}

/**
 * The same, against a value map the caller assembled.
 *
 * For content whose placeholders are not all tenant facts — a block may refer
 * to something about the organisation's programme that lives in the content
 * itself, like its team size. The caller extends `templateValues()` and passes
 * the result, so the tenant vocabulary stays exactly the tenant's.
 */
export function fillContentWith<T>(value: T, values: Record<string, string | undefined>): T {
  return fillDeep(value, values) as T;
}

function fillDeep(value: unknown, values: Record<string, string | undefined>): unknown {
  if (typeof value === 'string') return fillTemplate(value, values);
  if (Array.isArray(value)) return value.map((v) => fillDeep(v, values));
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, fillDeep(v, values)]),
    );
  }
  return value;
}

/** Every placeholder a block uses, for checking content against a tenant. */
export function placeholdersIn(value: unknown, found = new Set<string>()): Set<string> {
  if (typeof value === 'string') {
    for (const m of value.matchAll(PLACEHOLDER)) found.add(m[1]);
  } else if (Array.isArray(value)) {
    for (const v of value) placeholdersIn(v, found);
  } else if (value !== null && typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) placeholdersIn(v, found);
  }
  return found;
}
