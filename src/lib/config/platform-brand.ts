/**
 * Platform Brand — SSOT for the PLATFORM's identity (NOT the tenant's).
 *
 * The platform is the product; tenants (first: Revamp-IT) are organizations
 * using it. Tenant identity lives in org-profile.ts and must never define
 * the platform's name.
 *
 * NAMING: decided 2026-09-02 — the platform is "Hirnli", and it now has its
 * own host (hirnli.orangecat.ch) rather than borrowing the tenant's. Renaming
 * the platform = editing THIS FILE ONLY — if a rename requires touching
 * anything else, that's an SSOT violation to fix, not a search-and-replace to
 * run. (This edit was exactly that one-line change, which is the proof.)
 */

export const PLATFORM_BRAND = {
  name: 'Hirnli',
  tagline: 'Fundraising Hub',
  /** Platform marketing home (product pages, not a tenant site) */
  marketingPath: '/plattform',

  /**
   * The organisation the platform was built by and for.
   *
   * A fact about the PLATFORM's history, not about whoever is reading. The
   * product page says "developed by and for Revamp-IT — the first organisation
   * on the platform", and that sentence stays true for every later tenant; it
   * would become false the moment it read the viewing tenant's name instead.
   * It lived in `org-profile.ts` and was reached through `ORG_PROFILE.name`,
   * which pointed the platform at a tenant and made the product page
   * unrenderable without one.
   */
  foundingOrg: 'Revamp-IT',

  /**
   * Where to write about the PLATFORM. Today it is the founding organisation's
   * fundraising address because that organisation operates the platform —
   * which is a reason to state it here, not to read it off a tenant.
   */
  contactEmail: 'fundraising@revamp-it.ch',
} as const;

export type PlatformBrand = typeof PLATFORM_BRAND;
