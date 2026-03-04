/**
 * Theme metadata type — shared across Gesuch generation, cover letters, and UI
 *
 * This is the display shape used when rendering theme badges/pills.
 * Source data lives in THEMES (lib/config/foundations/metadata.ts).
 */

export interface ThemeMetadata {
  id: string;
  label: string;
  icon: string;
  color: string;
}
