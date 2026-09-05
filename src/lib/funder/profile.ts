/**
 * A foundation's own account of itself.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 * The platform holds 16,623 foundations as a RESEARCHED REGISTER: what could be
 * learned about each from public sources. That is outside-in knowledge, and it
 * is wrong in the ordinary ways outside-in knowledge is wrong — a deadline that
 * moved, a focus that shifted, a purpose summarised by someone who does not
 * work there.
 *
 * A foundation is a party on this platform, not a row in somebody's research.
 * This is the shape it fills in when it speaks for itself, and the fields are
 * chosen accordingly: everything here is something a foundation KNOWS rather
 * than something an outsider infers. There is no fit score and no priority —
 * those are opinions applicants hold about it, they live in
 * `fundraising_foundation_assessments`, and they are none of the foundation's
 * business.
 *
 * ── THE RULE THAT MATTERS ───────────────────────────────────────────────────
 * A stored row is the PLATFORM'S best understanding until `confirmed_at` is
 * set. Only then may it be shown as the foundation's own word. Presenting
 * researched data as a foundation's statement would put words in the mouth of
 * an organisation that never agreed to them — the same failure, in the other
 * direction, as putting one customer's certifications in another's deck.
 */

import { z } from 'zod';
import { ApplicationMethod, ThemeId } from '@/lib/schemas/foundation';

/** How to reach a foundation, as the foundation states it. */
const funderContactSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    contactName: z.string().optional(),
  })
  .strict();

/**
 * What a foundation publishes about how to apply.
 *
 * Deliberately not the register's `deadline`/`deadlineText` pair: that shape
 * exists because a scraped date is often a sentence rather than a date. A
 * foundation stating its own rounds can give both.
 */
const fundingRoundSchema = z
  .object({
    closesOn: z.string().optional(),
    describedAs: z.string().max(200).optional(),
  })
  .strict();

export const storedFunderProfileSchema = z
  .object({
    /** Must equal the register entry this profile is about. */
    foundationId: z.string().min(1),

    /** The legal name, as the foundation writes it. */
    name: z.string().min(1),

    /**
     * The foundation's purpose in its own words.
     *
     * The register has `purposeSummary`, written by whoever researched it. This
     * is the foundation's, and where both exist this one wins — the whole point
     * of letting a party speak for itself.
     */
    purpose: z.string().max(4000).optional(),

    /** Where it funds. Free text, because foundations describe this variously. */
    geography: z.string().max(500).optional(),

    /**
     * What it funds, in the platform's shared theme vocabulary.
     *
     * Shared rather than free text because this is what matching runs on: an
     * applicant's themes against a funder's. A foundation inventing its own
     * words here would be invisible to every search.
     */
    themes: z.array(ThemeId).optional(),

    applicationMethod: ApplicationMethod.optional(),
    applicationUrl: z.string().url().optional(),
    rounds: z.array(fundingRoundSchema).max(12).optional(),

    /** Typical grant range, in CHF. */
    grantMin: z.number().int().nonnegative().optional(),
    grantMax: z.number().int().nonnegative().optional(),

    website: z.string().url().optional(),
    contact: funderContactSchema.optional(),

    /** What the foundation wishes applicants knew before writing. */
    guidance: z.string().max(4000).optional(),
  })
  .strict()
  .refine((p) => p.grantMin === undefined || p.grantMax === undefined || p.grantMin <= p.grantMax, {
    message: 'grantMin must not exceed grantMax',
    path: ['grantMin'],
  });

export type StoredFunderProfile = z.infer<typeof storedFunderProfileSchema>;

/**
 * A funder profile as the app consumes it, with its provenance attached.
 *
 * `confirmed` is not decoration. Everything downstream must be able to say
 * whether a sentence is the foundation's or the platform's, because an
 * applicant reading "they fund youth projects" will act on it.
 */
export type FunderProfile = StoredFunderProfile & {
  confirmed: boolean;
  updatedAt: Date;
};

/** Parse a stored row. Throws on a shape that does not fit — never guesses. */
export function parseFunderProfile(
  profile: unknown,
  confirmedAt: Date | null,
  updatedAt: Date,
): FunderProfile {
  return {
    ...storedFunderProfileSchema.parse(profile),
    confirmed: confirmedAt !== null,
    updatedAt,
  };
}
