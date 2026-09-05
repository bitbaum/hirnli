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

/**
 * Every module holding unfilled `{{...}}`, the exports that carry it, and the
 * files allowed to read those raw.
 *
 * A table rather than one hard-coded module: `gesuch-templates.ts` became the
 * second one, and a rule written for a single module tends to be re-derived by
 * hand for the next instead of extended.
 */
const TEMPLATE_MODULES = [
  {
    module: '@/lib/config/stories',
    exports: ['WHY', 'GESUCH_TEXT', 'ANSCHREIBEN_TEMPLATES', 'PARTNER_HIGHLIGHTS'],
    // The composers fill the whole assembled tree through `fillStoryContent()`,
    // and the seed script writes the templates verbatim — that is its whole job.
    mayReadRaw: [
      'src/lib/config/stories.ts',
      'src/lib/domain/gesuch-composer.ts',
      'src/lib/domain/anschreiben-composer.ts',
      'src/lib/domain/bridge-composer.ts',
      'src/lib/domain/foundation-contextualization.ts',
    ],
  },
  {
    module: '@/lib/config/gesuch-templates',
    exports: ['TEMPLATE_FOUNDATIONS', 'TEMPLATE_LABELS'],
    // Only the module that defines them, via resolveTemplateFoundation() and
    // resolveTemplateLabels(). `documents.ts` builds per request through those.
    mayReadRaw: ['src/lib/config/gesuch-templates.ts'],
  },
];

function importersOfModule(modulePath: string): Map<string, Set<string>> {
  // Match on the module's BASENAME, not its alias path. Keying on
  // '@/lib/config/gesuch-templates' missed `documents.ts`, which sits in the
  // same directory and imports './gesuch-templates' — a file that reads the raw
  // table was invisible to the rule about reading the raw table. Caught by
  // mutation-testing: reintroducing the real bug left the suite green.
  //
  // Whole-file match, not line-based, for the same class of reason: composers
  // import across several lines, and a line-anchored grep reported them clean.
  const name = modulePath.split('/').pop()!;
  const files = execSync(`grep -rl "${name}'" src/ --include='*.ts' --include='*.tsx' || true`, {
    encoding: 'utf-8',
  })
    .split('\n')
    .filter(Boolean)
    .filter((f) => !f.includes('__tests__'));

  const byFile = new Map<string, Set<string>>();
  for (const file of files) {
    const src = readFileSync(file, 'utf-8');
    const names = new Set<string>();
    // `import { A, B } from '@/lib/config/stories'`, over any number of lines.
    // `import type { … }` is excluded: a type cannot render.
    // Any specifier ending in the module basename: '@/lib/config/x', './x',
    // '../config/x' are the same import written three ways.
    const IMPORT = new RegExp(
      String.raw`import\s+(type\s+)?\{([^}]*)\}\s*from\s*'(?:[^']*\/)?${name}'`,
      'g',
    );
    for (const m of src.matchAll(IMPORT)) {
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

function importersOf(modulePath: string, name: string): string[] {
  return [...importersOfModule(modulePath)]
    .filter(([, names]) => names.has(name))
    .map(([file]) => file);
}

describe('raw template content stays behind a resolver', () => {
  for (const { module, exports, mayReadRaw } of TEMPLATE_MODULES) {
    for (const name of exports) {
      it(`${name} is not imported outside its resolvers`, () => {
        const offenders = importersOf(module, name).filter((f) => !mayReadRaw.includes(f));

        expect(
          offenders,
          `${name} contains {{placeholders}} and must be read through a ` +
            `resolve*(tenant) function. Imported raw by: ${offenders.join(', ')}`,
        ).toEqual([]);
      });
    }

    it(`the ${module} allowlist has no stale entries`, () => {
      const definingModule = `src/${module.replace('@/', '')}.ts`;
      const stale = mayReadRaw
        .filter((f) => !exports.some((name) => importersOf(module, name).includes(f)))
        .filter((f) => f !== definingModule);

      expect(stale, `Allowed but no longer reads raw content: ${stale.join(', ')}`).toEqual([]);
    });
  }
});
