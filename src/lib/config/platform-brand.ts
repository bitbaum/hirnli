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
} as const;

export type PlatformBrand = typeof PLATFORM_BRAND;
