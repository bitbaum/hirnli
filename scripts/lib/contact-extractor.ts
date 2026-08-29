/**
 * Contact Extractor — Extract email, phone, application method, and grant range from HTML text
 *
 * Pure regex-based extraction. No LLM calls. Designed for Swiss foundation websites.
 *
 * Used by web-enrich.ts to mechanically extract contact data from foundation websites.
 */

// ============================================================================
// Types
// ============================================================================

export interface ExtractedContact {
  emails: string[];
  phones: string[];
  applicationMethod: 'online' | 'email' | 'invitation' | 'unknown';
  grantRange: {
    min?: number;
    max?: number;
  };
}

// ============================================================================
// Email extraction
// ============================================================================

// Common false positives to exclude
const EMAIL_BLACKLIST = new Set([
  'info@example.com',
  'test@test.com',
  'noreply@',
  'no-reply@',
  'webmaster@',
  'postmaster@',
  'hostmaster@',
  'abuse@',
]);

const EMAIL_REGEX = /[\w.+-]+@[\w.-]+\.\w{2,}/g;

export function extractEmails(text: string): string[] {
  const matches = text.match(EMAIL_REGEX) || [];

  // Deduplicate and filter out blacklisted patterns
  const unique = Array.from(new Set(matches.map((e) => e.toLowerCase())));
  return unique.filter((email) => {
    // Filter out image/file extensions mistakenly captured
    if (/\.(png|jpg|jpeg|gif|svg|css|js|pdf)$/i.test(email)) return false;
    // Filter out blacklisted prefixes
    for (const bl of EMAIL_BLACKLIST) {
      if (email.startsWith(bl)) return false;
    }
    return true;
  });
}

// ============================================================================
// Phone extraction (Swiss patterns)
// ============================================================================

// Swiss phone patterns:
// +41 XX XXX XX XX, +41 (0)XX XXX XX XX
// 0XX XXX XX XX, 0XX/XXX XX XX
// Also accepts dots and dashes as separators
const SWISS_PHONE_REGEX =
  /(?:\+41|0041)[\s.]?\(?\d?\)?[\s./\-]?\d{2}[\s./\-]?\d{3}[\s./\-]?\d{2}[\s./\-]?\d{2}|0\d{2}[\s./\-]?\d{3}[\s./\-]?\d{2}[\s./\-]?\d{2}/g;

export function extractPhones(text: string): string[] {
  const matches = text.match(SWISS_PHONE_REGEX) || [];

  // Normalize: collapse whitespace, standardize format
  const normalized = matches
    .map((p) => {
      // Remove all whitespace/separators to get digits
      const digits = p.replace(/[^\d+]/g, '');
      // Skip if too short (false positive)
      if (digits.replace('+', '').length < 10) return null;
      return p.trim();
    })
    .filter(Boolean) as string[];

  return Array.from(new Set(normalized));
}

// ============================================================================
// Application method detection
// ============================================================================

const INVITATION_KEYWORDS = [
  'auf einladung',
  'keine unaufgeforderten',
  'nicht möglich, unaufgefordert',
  'nur auf einladung',
  'keine eigenständige',
  'kein offener',
  'vergabe erfolgt',
  'eigeninitiativ',
  'ohne aufforderung',
  'unaufgeforderte gesuche werden nicht',
  'sur invitation',
  'pas de demandes spontanées',
  'ne traite pas les demandes spontanées',
  'su invito',
];

const ONLINE_KEYWORDS = [
  'online-formular',
  'online formular',
  'online-gesuch',
  'gesuchsformular',
  'antragsformular',
  'formulaire en ligne',
  'online-portal',
  'förderportal',
  'portal',
  'submit online',
  'online einreichen',
];

const EMAIL_METHOD_KEYWORDS = [
  'per e-mail',
  'per mail',
  'per email',
  'senden sie',
  'bitte senden',
  'par e-mail',
  'par courriel',
];

export function detectApplicationMethod(
  text: string,
): 'online' | 'email' | 'invitation' | 'unknown' {
  const lower = text.toLowerCase();

  // Check invitation first — it's the strongest signal
  for (const kw of INVITATION_KEYWORDS) {
    if (lower.includes(kw)) return 'invitation';
  }

  // Online portal/form
  for (const kw of ONLINE_KEYWORDS) {
    if (lower.includes(kw)) return 'online';
  }

  // Email submission
  for (const kw of EMAIL_METHOD_KEYWORDS) {
    if (lower.includes(kw)) return 'email';
  }

  return 'unknown';
}

// ============================================================================
// Grant range extraction
// ============================================================================

// Look for CHF/Fr. amounts near funding-related keywords
const AMOUNT_REGEX = /(?:CHF|Fr\.?|Franken)\s*[\d'.,]+|[\d'.,]+\s*(?:CHF|Fr\.?|Franken)/gi;

function parseSwissAmount(raw: string): number | null {
  // Extract just the numeric part
  const numStr = raw
    .replace(/CHF|Fr\.?|Franken/gi, '')
    .replace(/['\s]/g, '') // Swiss thousand separator is apostrophe
    .replace(/,(\d{2})$/, '.$1') // Convert comma decimal to dot
    .trim();

  const num = parseFloat(numStr);
  if (isNaN(num) || num < 100 || num > 100_000_000) return null;
  return num;
}

export function extractGrantRange(text: string): { min?: number; max?: number } {
  // Only look near funding-related context
  const fundingContext = text.toLowerCase();
  const hasFundingKeywords = [
    'beitrag',
    'beiträge',
    'förder',
    'unterstütz',
    'zuwendung',
    'grant',
    'contribution',
    'subvention',
    'betrag',
    'minimum',
    'maximum',
    'höchstens',
    'mindestens',
    'bis zu',
  ].some((kw) => fundingContext.includes(kw));

  if (!hasFundingKeywords) return {};

  const matches = text.match(AMOUNT_REGEX) || [];
  const amounts = matches
    .map(parseSwissAmount)
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b);

  if (amounts.length === 0) return {};
  if (amounts.length === 1) return { max: amounts[0] };

  return {
    min: amounts[0],
    max: amounts[amounts.length - 1],
  };
}

// ============================================================================
// Combined extraction
// ============================================================================

export function extractContactData(text: string): ExtractedContact {
  return {
    emails: extractEmails(text),
    phones: extractPhones(text),
    applicationMethod: detectApplicationMethod(text),
    grantRange: extractGrantRange(text),
  };
}
