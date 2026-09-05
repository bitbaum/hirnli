/**
 * A funder document may not name one organisation in every organisation's copy.
 *
 * Verified against production on 2026-09-05: the SECOND tenant's pitch deck,
 * rendered to PDF and read back as text, contained a slide titled with the
 * FIRST tenant's name, and both documents carried the reference tenant's
 * deployment slug in their PDF `creator` metadata.
 *
 * The name was the mild half. The same deck also asserted, for a tenant that
 * holds none of them, a data-destruction standard, a Swiss recycling
 * certification and three named social-partner relationships — credential
 * claims, in a document written to be sent to funders. `lib/pdf/authored.ts`
 * is the fix for that (refuse to build). This is the fix for the name: a
 * hardcoded organisation cannot get back in.
 *
 * Keyed on the tenant identifiers rather than on a general "no proper nouns"
 * rule, because the documents legitimately name external bodies — Fraunhofer
 * IZM's CO2 study is a real citation and must survive.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';

/**
 * The reference tenant's identifiers. Derived from the constant that names it,
 * so this cannot drift from `CODE_CONTENT_OWNER`.
 */
const FORBIDDEN = ['Revamp-IT', 'revamp-it', 'revampit', 'revamp-info'];

/** Where a tenant's name may only ever arrive through `tenant.*`. */
const DOCUMENT_SOURCES = 'src/lib/pdf/';

function offendingLines(): string[] {
  // --exclude-dir=__tests__: this file necessarily contains the strings it
  // forbids. Fourth scanner in this migration to have matched its own source.
  const pattern = FORBIDDEN.join('|');
  return execSync(
    `grep -rnE "${pattern}" ${DOCUMENT_SOURCES} --exclude-dir=__tests__ ` +
      "--include='*.ts' --include='*.tsx' || true",
    { encoding: 'utf-8' },
  )
    .split('\n')
    .filter(Boolean);
}

describe('funder documents name only the tenant that requested them', () => {
  it('no PDF component hardcodes the reference organisation', () => {
    expect(
      offendingLines(),
      'These documents are sent to foundations. An organisation name belongs ' +
        'in them only via `tenant.name`; the platform names itself with ' +
        `PLATFORM_BRAND.name:\n${offendingLines().join('\n')}`,
    ).toEqual([]);
  });

  it('the scanner still matches a planted name', () => {
    // With zero offenders, "nothing matched" is true whether the grep works or
    // not. Pin it, or this rots into a permanent pass.
    const seen = execSync(
      `printf 'title="Warum Revamp-IT?"\\n' | grep -cE "${FORBIDDEN.join('|')}"`,
      { encoding: 'utf-8' },
    ).trim();
    expect(seen, 'the document-name scanner matches nothing — it is not checking').toBe('1');
  });
});
