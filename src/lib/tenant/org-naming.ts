/**
 * The naming rules for a new organisation — pure, and importable by the form.
 *
 * Split from `provision.ts` for a concrete reason: the sign-up form is a client
 * component and shows the address as you type, so it imports `slugify`. When
 * that lived beside the database writes, Turbopack followed the import into
 * `pg` and tried to bundle a Postgres driver for the browser — the build failed
 * with "Can\'t resolve \'dns\'". Pure rules and the writes that use them are
 * different things and now live in different files.
 */

import { z } from 'zod';
import { PLATFORM_HOST } from './registry';

/**
 * What someone must tell us to get an account.
 *
 * Exactly the facts `storedTenantProfileSchema` requires and no more. Asking
 * for an address or a phone number here would be asking a new customer to fill
 * a form before they can see anything, and both are optional in the profile
 * precisely because a young organisation may not have them.
 */
export const newOrganizationSchema = z.object({
  name: z.string().trim().min(2, 'Bitte den Namen der Organisation angeben').max(120),
  legalForm: z.string().trim().min(2, 'Bitte die Rechtsform angeben').max(120),
  founded: z.coerce
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear(), 'Ein Gründungsjahr in der Zukunft ist keins'),
  location: z.string().trim().min(2, 'Bitte den Ort angeben').max(120),
  email: z.string().trim().email('Bitte eine gültige E-Mail-Adresse angeben'),
});

export type NewOrganization = z.infer<typeof newOrganizationSchema>;

/**
 * A URL- and DNS-safe slug, which is also the org id scoping every row.
 *
 * Deliberately conservative: this string ends up in a hostname, a URL path and
 * a `WHERE org_id = …` clause, and the intersection of what those three accept
 * is narrower than any one of them.
 */
export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      // German transliteration BEFORE stripping diacritics, not after. NFD
      // decomposes "\u00fc" into "u" + a combining diaeresis, so normalising first
      // and then removing marks yields "gruene" -> "grune": the umlaut is gone
      // rather than spelled out, and a customer's own name is misspelled in
      // their hostname on the day they sign up.
      .replace(/\u00e4/g, 'ae')
      .replace(/\u00f6/g, 'oe')
      .replace(/\u00fc/g, 'ue')
      .replace(/\u00df/g, 'ss')
      // Anything else accented (French, Italian — both plausible in Switzerland)
      // loses its mark rather than the letter.
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40)
      // The slice can land on a hyphen, which is an invalid DNS label ending.
      .replace(/-+$/g, '')
  );
}

/** Reserved because they are the product's own, or would shadow a real route. */
export const RESERVED_SLUGS = new Set([
  'www',
  'api',
  'app',
  'admin',
  'platform',
  'plattform',
  'hirnli',
  'start',
  'anmelden',
  'registrieren',
  'o',
]);

/** The host a new tenant gets: a subdomain of the platform. */
export function hostForSlug(slug: string): string {
  return `${slug}.${PLATFORM_HOST}`;
}
