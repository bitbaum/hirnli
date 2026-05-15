/**
 * Branding Configuration - SSOT
 *
 * Visual identity for the fundraising platform.
 * Org identity comes from org-profile.ts; this file owns visual identity only.
 *
 * Last Updated: 2026-02-18
 */

import { ORG_PROFILE } from './org-profile';

export const BRANDING = {
  // Logo assets
  logo: {
    main: '/revampit-icon.png', // Orange smiling chip icon (text shown separately)
    alt: `${ORG_PROFILE.name} Icon`,
    width: 40,
    height: 40,
  },

  // Site identity
  siteName: ORG_PROFILE.platform.name,
  siteTagline: ORG_PROFILE.platform.tagline,

  // Typography
  fonts: {
    sans: 'var(--font-inter), "Segoe UI", system-ui, -apple-system, sans-serif',
    mono: '"Consolas", "Monaco", monospace',
  },
} as const;
