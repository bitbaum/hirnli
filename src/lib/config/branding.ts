/**
 * PLATFORM visual identity. Not any tenant's.
 *
 * This file used to hold `logo.main: '/revampit-icon.png'` — one customer's
 * logo — under a header calling itself the SSOT for visual identity. The result
 * was every tenant rendering under Revamp-IT's mark, evig included.
 *
 * The rule that decides what belongs here: **anything that varies per tenant is
 * data; only what is identical for every tenant may be code.** A logo varies. A
 * brand colour varies. The platform's font stack does not.
 *
 * Tenant visual identity lives in `org_profiles.branding`, read via
 * `getTenantBranding()`. A tenant with no branding renders UNBRANDED — never
 * under another tenant's mark, because "fall back to the first tenant" is
 * precisely what this bug looked like from the inside.
 */

import { PLATFORM_BRAND } from './platform-brand';

export const BRANDING = {
  // Platform identity, for platform chrome (Surfaces A and B).
  siteName: PLATFORM_BRAND.name,
  siteTagline: PLATFORM_BRAND.tagline,

  // Typography is platform-wide on purpose: a tenant gets its mark and colour,
  // not a different typeface, so the product stays recognisably one product.
  fonts: {
    sans: 'var(--font-inter), "Segoe UI", system-ui, -apple-system, sans-serif',
    mono: '"Consolas", "Monaco", monospace',
  },

  /** Space the chrome reserves for a tenant mark, so layout holds while it loads. */
  logoBox: { width: 40, height: 40 },
} as const;
