/**
 * Where a foundation's own words replace the platform's research.
 *
 * The register entry is outside-in: assembled from Zefix, a website, published
 * reports. A funder profile is inside-out. Where they disagree about something
 * the foundation is the authority on — its purpose, whom to write to, when the
 * round closes, what it typically gives — the foundation wins.
 *
 * Deliberately NOT a blanket spread of one object over the other. Only fields a
 * foundation is genuinely authoritative about are overlaid. It is not the
 * authority on how well it matches an applicant, how thoroughly it has been
 * researched, or which Schmuki type it is; those are the platform's or the
 * applicant's, and a foundation editing them would be marking its own homework.
 *
 * And nothing is overlaid at all until the profile is CONFIRMED. Before that
 * the row is the platform's best understanding — often better than the register,
 * but not the foundation's statement, and presenting it as one would put words
 * in the mouth of an organisation that never agreed to them.
 */

import type { Foundation } from '@/lib/schemas/foundation';
import type { FunderProfile } from './profile';

/** Which fields the foundation is the authority on. Documentation, and a test reads it. */
export const FUNDER_AUTHORED_FIELDS = [
  'name',
  'purposeSummary',
  'websiteUrl',
  'applicationMethod',
  'themes',
  'amount',
  'contact',
  'deadlineText',
] as const;

/** A foundation as it should be shown, with its own words applied. */
export function applyFunderProfile(
  foundation: Foundation,
  profile: FunderProfile | null,
): Foundation & { funderConfirmed: boolean } {
  if (!profile || !profile.confirmed) {
    return { ...foundation, funderConfirmed: false };
  }

  const nextRound = profile.rounds?.[0];

  return {
    ...foundation,
    funderConfirmed: true,

    name: profile.name || foundation.name,
    purposeSummary: profile.purpose ?? foundation.purposeSummary,
    websiteUrl: profile.website ?? foundation.websiteUrl,
    applicationMethod: profile.applicationMethod ?? foundation.applicationMethod,
    themes: profile.themes?.length ? profile.themes : foundation.themes,

    // Only replace the range when the foundation actually gave one. A partial
    // answer must not blank the half the register knows.
    amount:
      profile.grantMin !== undefined || profile.grantMax !== undefined
        ? {
            ...foundation.amount,
            min: profile.grantMin ?? foundation.amount.min,
            max: profile.grantMax ?? foundation.amount.max,
          }
        : foundation.amount,

    contact: profile.contact
      ? {
          ...foundation.contact,
          ...(profile.contact.email !== undefined && { email: profile.contact.email }),
          ...(profile.contact.phone !== undefined && { phone: profile.contact.phone }),
          ...(profile.contact.address !== undefined && { address: profile.contact.address }),
        }
      : foundation.contact,

    deadlineText: nextRound?.describedAs ?? foundation.deadlineText,
  };
}
