/**
 * Branding Configuration - SSOT
 *
 * Visual identity for Revamp-Info (fundraising platform)
 * Inherits from Revamp-IT brand identity but specialized for fundraising context
 *
 * Last Updated: 2026-02-13
 */

export const BRANDING = {
  // Logo assets (from main Revamp-IT site)
  logo: {
    main: '/revampit-icon.png', // Orange smiling chip icon (text shown separately)
    alt: 'Revamp-IT Icon',
    width: 40,
    height: 40,
  },

  // Site identity
  siteName: 'Revamp-Info',
  siteTagline: 'Fundraising Hub',

  // Brand colors (inherited from Revamp-IT)
  colors: {
    primary: '#2ECC71',      // Revamp Green
    secondary: '#3498DB',    // Revamp Blue
    accent: '#E67E22',       // Revamp Orange

    // Chip logo colors for reference
    chipOrange: '#FF9933',   // Orange chip body
    chipGreen: '#2ECC71',    // Green smile/eyes
  },

  // Typography
  fonts: {
    sans: 'var(--font-inter), "Segoe UI", system-ui, -apple-system, sans-serif',
    mono: '"Consolas", "Monaco", monospace',
  },
} as const;

// Type exports
export type BrandingConfig = typeof BRANDING;
