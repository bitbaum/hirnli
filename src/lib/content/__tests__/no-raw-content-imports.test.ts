/**
 * Template content may only be read through `resolveStories()`.
 *
 * `WHY`, `GESUCH_TEXT`, `ANSCHREIBEN_TEMPLATES` and `PARTNER_HIGHLIGHTS` are
 * template text: they contain `{{founded}}` and `{{yearsActive}}`, and only
 * `resolveStories()` fills them for a given tenant. Importing them directly and
 * rendering them puts the braces on the page.
 *
 * This is not theoretical. `no-unfilled-placeholders.test.ts` asserts the
 * composers emit no placeholders, and it passed — while
 * `/fundraising/gesuch-vorlagen/generisch/dokument` rendered a live Gesuch
 * document containing the literal text `{{founded}}` and `{{yearsActive}}`,
 * because four renderers imported `GESUCH_TEXT` straight from the module rather
 * than taking it from the composed document. A test of the composers cannot see
 * a component that goes around them.
 *
 * So this checks the import, which is the thing that actually varies. It is a
 * grep rather than a render, deliberately: this repo has no jsdom, and a
 * source-level rule about imports is unambiguous in a way that JSX parsing is
 * not.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

/** The exports that carry unfilled `{{...}}` and must be resolved first. */
const TEMPLATE_EXPORTS = ['WHY', 'GESUCH_TEXT', 'ANSCHREIBEN_TEMPLATES', 'PARTNER_HIGHLIGHTS'];

/**
 * Where reading the raw templates is correct.
 *
 * The composers fill the whole assembled tree through `fillStoryContent()`, and
 * the seed script writes the templates verbatim — that is its entire job.
 */
const MAY_READ_RAW = [
  'src/lib/config/stories.ts',
  'src/lib/domain/gesuch-composer.ts',
  'src/lib/domain/anschreiben-composer.ts',
  'src/lib/domain/bridge-composer.ts',
  'src/lib/domain/foundation-contextualization.ts',
];

function storiesImporters(): Map<string, Set<string>> {
  // Whole-file match, not line-based: `gesuch-composer.ts` imports across
  // several lines, and a line-anchored grep silently reported it as clean.
  // A detector blind to the way the code is actually written is worse than no
  // detector, because it reads as a pass.
  const files = execSync(
    "grep -rl \"@/lib/config/stories\" src/ --include='*.ts' --include='*.tsx' || true",
    { encoding: 'utf-8' },
  )
    .split('\n')
    .filter(Boolean)
    .filter((f) => !f.includes('__tests__'));

  const byFile = new Map<string, Set<string>>();
  for (const file of files) {
    const src = readFileSync(file, 'utf-8');
    const names = new Set<string>();
    // `import { A, B } from '@/lib/config/stories'`, over any number of lines.
    // `import type { … }` is excluded: a type cannot render.
    for (const m of src.matchAll(
      /import\s+(type\s+)?\{([^}]*)\}\s*from\s*'@\/lib\/config\/stories'/g,
    )) {
      if (m[1]) continue;
      for (const raw of m[2].split(',')) {
        const name = raw
          .trim()
          .split(/\s+as\s+/)[0]
          .trim();
        if (name) names.add(name);
      }
    }
    if (names.size > 0) byFile.set(file, names);
  }
  return byFile;
}

function importersOf(name: string): string[] {
  return [...storiesImporters()].filter(([, names]) => names.has(name)).map(([file]) => file);
}

describe('raw template content stays behind resolveStories()', () => {
  for (const name of TEMPLATE_EXPORTS) {
    it(`${name} is not imported outside the composers`, () => {
      const offenders = importersOf(name).filter((f) => !MAY_READ_RAW.includes(f));

      expect(
        offenders,
        `${name} contains {{placeholders}} and must be read via resolveStories(tenant). ` +
          `Imported raw by: ${offenders.join(', ')}`,
      ).toEqual([]);
    });
  }

  it('the allowlist has no stale entries', () => {
    const stale = MAY_READ_RAW.filter(
      (f) => !TEMPLATE_EXPORTS.some((name) => importersOf(name).includes(f)),
    ).filter((f) => f !== 'src/lib/config/stories.ts');

    expect(stale, `Allowed but no longer reads raw content: ${stale.join(', ')}`).toEqual([]);
  });
});
