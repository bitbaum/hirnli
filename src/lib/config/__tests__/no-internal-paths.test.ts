/**
 * The organisation's private file tree does not belong on a public page.
 *
 * Eight places wrote a path out of the internal document store — five metric
 * `source.path` values, and three rendered directly into JSX, including one
 * inside a `<code>` block on the pricing page and one under "Datenquellen" on
 * the impact page. Anyone loading the site read the shape of a Nextcloud they
 * cannot open: which numbered top-level folder holds finance, what the
 * accounting export is called, where the KPI framework lives.
 *
 * There WAS a sanitiser. `NumberInspector.getDonorFriendlySource()` has always
 * stripped directories off these strings before display — so the metric paths
 * were safe, and the JSX ones, which never went through it, were not. A
 * sanitiser at one exit protects that exit only. This checks the source
 * instead, where the string is written, which is the one place all eight had
 * in common.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';

/**
 * A numbered top-level folder — `01_Management/`, `02_Betrieb/` — is the naming
 * convention of the internal store, and nothing the app legitimately ships
 * looks like it. Keyed on the shape rather than on a list of folder names, so a
 * new one is caught the first time it appears.
 */
const INTERNAL_PATH = String.raw`[0-9]{2}_[A-Z][A-Za-z]+/`;

function offenders(): string[] {
  // --exclude-dir=__tests__: this file necessarily contains the pattern it
  // hunts for, and would otherwise report itself. (Third time in this
  // migration that a scanner matched its own source.)
  const out = execSync(
    `grep -rnE "${INTERNAL_PATH}" src/ --exclude-dir=__tests__ ` +
      "--include='*.ts' --include='*.tsx' || true",
    { encoding: 'utf-8' },
  );
  return out.split('\n').filter(Boolean);
}

describe('internal document paths stay internal', () => {
  it('no source file writes a path from the internal store', () => {
    expect(
      offenders(),
      "This is a path inside the organisation's private file tree. Readers " +
        'cannot open it and should not see its shape — name the source instead ' +
        `("Finanzbuchhaltung 2025"):\n${offenders().join('\n')}`,
    ).toEqual([]);
  });

  it('the pattern still matches one when there is one', () => {
    // With zero offenders left, the assertion above is true whether or not the
    // scanner works. Pin the scanner itself, or it rots into a green light.
    const seen = execSync(
      `printf "path: '01_Management/B_Finanzen/x.xlsx'\\n" | grep -cE "${INTERNAL_PATH}"`,
      { encoding: 'utf-8' },
    ).trim();
    expect(seen, 'the internal-path scanner matches nothing — it is not checking').toBe('1');
  });
});
