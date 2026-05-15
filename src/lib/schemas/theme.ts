/**
 * Theme metadata schema — shared across Gesuch generation, cover letters, and UI
 *
 * This is the display shape used when rendering theme badges/pills.
 * Source data lives in THEMES (lib/config/foundations/metadata.ts).
 */

import { z } from 'zod';

const themeMetadataSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string(),
  color: z.string(),
});

export type ThemeMetadata = z.infer<typeof themeMetadataSchema>;
