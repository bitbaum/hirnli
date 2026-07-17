/**
 * Platform Brand — SSOT for the PLATFORM's identity (NOT the tenant's).
 *
 * The platform is the product; tenants (first: Revamp-IT) are organizations
 * using it. Tenant identity lives in org-profile.ts and must never define
 * the platform's name.
 *
 * NAMING: the final product name is UNDECIDED (candidate: "Hirnli").
 * "Revamp-Info" is the working title. Renaming the platform = editing THIS
 * FILE ONLY — if a rename requires touching anything else, that's an SSOT
 * violation to fix, not a search-and-replace to run.
 */

export const PLATFORM_BRAND = {
  /** Working title — see naming note above */
  name: 'Revamp-Info',
  tagline: 'Fundraising Hub',
  /** Platform marketing home (product pages, not a tenant site) */
  marketingPath: '/plattform',
} as const;

export type PlatformBrand = typeof PLATFORM_BRAND;
