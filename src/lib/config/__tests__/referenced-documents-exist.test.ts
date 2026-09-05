/**
 * A document the site links to must actually ship.
 *
 * Eleven local documents were referenced from config — seven as the
 * `documentUrl` behind the "Quelldokument ansehen (PDF)" button on the
 * transparency pages, four as downloads on `/dokumente`. All eleven 404'd, and
 * always had: `public/documents/` has never held anything but `.gitkeep` files.
 *
 * The gap was not unknown. `public/documents/README.md` listed those exact
 * filenames under "referenced but not uploaded" and marked every directory
 * partial or empty — in February. A README recorded the risk while the UI went
 * on rendering a download button for it, which is the failure mode where
 * documentation substitutes for a check.
 *
 * This is the check. It makes the reference and the file land in one commit,
 * which is the only arrangement where the button cannot lie. It matters more
 * here than in most apps: these links are the evidence behind impact numbers
 * shown to foundations, and a dead source link is worse for that argument than
 * no source link at all.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/** Every local asset path written as a string literal in the app source. */
function referencedLocalFiles(): string[] {
  // Any '/documents/...' or '/downloads/...' literal, wherever it is written:
  // a `documentUrl`, an `href`, or a field neither of those names yet. Keying
  // on the path rather than the property is the point — the previous
  // convention (`documentUrl`) was one of two spellings for the same promise.
  // `--exclude-dir=__tests__` is load-bearing twice over: this file writes the
  // very paths it looks for, so without it the scanner reports ITSELF as a
  // broken link — and a fixture path in a test is not a link the site renders.
  const out = execSync(
    "grep -rhoE \"'/(documents|downloads)/[^']+'\" src/ --exclude-dir=__tests__ " +
      "--include='*.ts' --include='*.tsx' || true",
    { encoding: 'utf-8' },
  );

  return [
    ...new Set(
      out
        .split('\n')
        .filter(Boolean)
        .map((l) => l.replace(/'/g, '')),
    ),
  ].sort();
}

describe('every referenced document ships', () => {
  it('resolves to a real file under public/', () => {
    const missing = referencedLocalFiles().filter(
      (href) => !existsSync(join(process.cwd(), 'public', href)),
    );

    expect(
      missing,
      'Referenced but not in public/ — the UI renders a download button for each ' +
        'of these and it 404s. Add the file in this commit, or remove the ' +
        `reference: ${missing.join(', ')}`,
    ).toEqual([]);
  });

  it('does not silently pass by finding nothing to check', () => {
    // The assertion above is vacuously true if the grep breaks or the paths
    // move to a prefix it does not know. Then the check reads as a pass while
    // checking nothing, which is how the README ended up being the only record
    // that the files were missing.
    //
    // There are legitimately zero local document references right now, so this
    // pins the grep itself instead: seed a path, and it must be seen.
    const seen = execSync(
      "printf \"const a = '/documents/x.pdf';\\n\" | grep -ohE \"'/(documents|downloads)/[^']+'\"",
      { encoding: 'utf-8' },
    ).trim();

    expect(seen, 'the reference scanner matches nothing — it is not checking').toBe(
      "'/documents/x.pdf'",
    );
  });
});
