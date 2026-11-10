/**
 * Platform Brand — SSOT for the PLATFORM's identity (NOT the tenant's).
 *
 * The platform is the product; tenants (first: Revamp-IT) are organizations
 * using it. Tenant identity lives in `org_profiles` and must never define the
 * platform's name.
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
   * The organisations set up on the platform today, as named on the product
   * page. Two customers: Revamp-IT, the Zürich IT refurbisher whose
   * fundraising the research scripts were first written against, and evig,
   * the organisation run by the platform's operator. A fact about the
   * PLATFORM, not about whoever is reading: it must never read the viewing
   * tenant's name instead. Neither organisation develops or operates Hirnli.
   */
  organisations: ['Revamp-IT', 'evig'],

  /**
   * Where to write about the PLATFORM: its operator, not a tenant. Tenant
   * contact addresses live in each organisation's profile.
   */
  contactEmail: 'cato@orangecat.ch',
} as const;

export type PlatformBrand = typeof PLATFORM_BRAND;
