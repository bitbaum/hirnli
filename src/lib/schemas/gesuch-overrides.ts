import { z } from 'zod';

export const gesuchOverridesSchema = z.object({
  foundationBridge: z.string().optional(),
  why: z.object({
    headline: z.string().optional(),
    hook: z.string().optional(),
    problem: z.string().optional(),
    solution: z.string().optional(),
  }).optional(),
  how: z.object({
    trackRecord: z.object({
      headline: z.string().optional(),
      text: z.string().optional(),
    }).optional(),
  }).optional(),
  anschreiben: z.object({
    subject: z.string().optional(),
    opening: z.string().optional(),
    themeAlignment: z.string().optional(),
    closing: z.string().optional(),
  }).optional(),
});

export type GesuchOverridesData = z.infer<typeof gesuchOverridesSchema>;
