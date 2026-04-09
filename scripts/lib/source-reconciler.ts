/**
 * Source Reconciler — Compare contacts from multiple sources and pick the best
 *
 * Given contact candidates from Spheriq, website scraping, etc.,
 * determines the highest-confidence email/phone and tags provenance.
 */

export interface ContactCandidate {
  email?: string;
  phone?: string;
  source: string;       // e.g., 'spheriq', 'website:/kontakt', 'website:/impressum'
  sourceUrl: string;    // the URL where this was found
}

export type Confidence = 'high' | 'medium' | 'low';

export interface ReconciledContact {
  email?: string;
  emailSource?: string;
  emailConfidence?: Confidence;
  phone?: string;
  phoneSource?: string;
  phoneConfidence?: Confidence;
  allSources: ContactCandidate[];
  conflicts: string[];  // descriptions of disagreements
}

// Known garbage patterns
const GARBAGE_EMAIL = /sentry|wixpress|gta-design|\.png|\.jpg|\.webp|\.css|\.js|[{}\\]/i;
const GARBAGE_PHONE = /\+41 000|\+41 123456|00000|99999/;
const PREFERRED_PREFIXES = ['info@', 'kontakt@', 'contact@', 'stiftung@', 'sekretariat@', 'office@', 'mail@'];

function isGarbageEmail(email: string): boolean {
  return GARBAGE_EMAIL.test(email) || email.length < 5 || email.length > 60 || !email.includes('@');
}

function isGarbagePhone(phone: string): boolean {
  return GARBAGE_PHONE.test(phone) || phone.replace(/\D/g, '').length < 10;
}

/** Score an email for preference (lower = better) */
function emailPreferenceScore(email: string): number {
  const lower = email.toLowerCase();
  const idx = PREFERRED_PREFIXES.findIndex(p => lower.startsWith(p));
  return idx >= 0 ? idx : PREFERRED_PREFIXES.length;
}

/**
 * Reconcile contacts from multiple sources.
 *
 * Rules:
 * - If multiple sources agree on the same email → high confidence
 * - If only one source has an email → medium confidence
 * - If sources disagree → pick the preferred one, flag the conflict
 * - Filter garbage (Sentry, image filenames, placeholder phones)
 */
export function reconcileContacts(candidates: ContactCandidate[]): ReconciledContact {
  const result: ReconciledContact = { allSources: candidates, conflicts: [] };

  // Collect all non-garbage emails with their sources
  const emails = candidates
    .filter(c => c.email && !isGarbageEmail(c.email))
    .map(c => ({ email: c.email!.toLowerCase(), source: c.source, sourceUrl: c.sourceUrl }));

  // Collect all non-garbage phones
  const phones = candidates
    .filter(c => c.phone && !isGarbagePhone(c.phone))
    .map(c => ({ phone: c.phone!, source: c.source, sourceUrl: c.sourceUrl }));

  // Reconcile emails
  if (emails.length > 0) {
    const uniqueEmails = [...new Set(emails.map(e => e.email))];

    if (uniqueEmails.length === 1) {
      // All sources agree
      result.email = uniqueEmails[0];
      result.emailSource = emails.map(e => e.source).join('+');
      result.emailConfidence = emails.length > 1 ? 'high' : 'medium';
    } else {
      // Sources disagree — pick best, flag conflict
      result.conflicts.push(
        `Email conflict: ${uniqueEmails.map((e, i) => `${e} (${emails.find(x => x.email === e)!.source})`).join(' vs ')}`
      );
      // Pick by preference (info@ > kontakt@ > first found)
      const sorted = emails.sort((a, b) => emailPreferenceScore(a.email) - emailPreferenceScore(b.email));
      result.email = sorted[0].email;
      result.emailSource = sorted[0].source;
      result.emailConfidence = 'low';
    }
  }

  // Reconcile phones
  if (phones.length > 0) {
    // Normalize for comparison
    const normalize = (p: string) => p.replace(/[\s.\-()]/g, '');
    const uniquePhones = [...new Set(phones.map(p => normalize(p.phone)))];

    if (uniquePhones.length === 1) {
      result.phone = phones[0].phone;
      result.phoneSource = phones.map(p => p.source).join('+');
      result.phoneConfidence = phones.length > 1 ? 'high' : 'medium';
    } else {
      result.conflicts.push(
        `Phone conflict: ${phones.map(p => `${p.phone} (${p.source})`).join(' vs ')}`
      );
      result.phone = phones[0].phone;
      result.phoneSource = phones[0].source;
      result.phoneConfidence = 'low';
    }
  }

  return result;
}
