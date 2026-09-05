/**
 * The stored story block must contain everything a Gesuch is composed from.
 *
 * `STORIES_CONTENT` is what `scripts/seed-org-content.ts` writes into
 * `org_content['stories']`, and what a tenant reads back. It held five of the
 * ten content structures in this module. The other five — the competency
 * sections, the project descriptions, the citations, the anecdotes and the
 * photo slots — were reachable only from code.
 *
 * That gap is invisible with one tenant and specific with two: the second
 * tenant would read its OWN why-sections from the database and then take the
 * first tenant's competencies, projects and evidence from the module, inside
 * the same document. A partially migrated story is worse than an unmigrated
 * one, because it looks finished.
 *
 * So this asserts the block is closed over the composer's inputs: every
 * content structure the story composer reads has to be in the block that
 * travels to the database.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { STORIES_CONTENT } from '../stories';

const SOURCE = 'src/lib/config/stories.ts';

/**
 * Content structures in the module: a top-level `const NAME` whose value is an
 * object or array literal and whose name is SCREAMING_CASE. Deliberately
 * derived from the source rather than listed here — a list would need updating
 * by the same person who forgot to update the block.
 */
function declaredContentBlocks(): string[] {
  const src = readFileSync(SOURCE, 'utf-8');
  return [...src.matchAll(/^(?:export )?const ([A-Z][A-Z0-9_]+)(?::[^=]+)?\s*=\s*[[{]/gm)]
    .map((m) => m[1])
    .filter((name) => name !== 'STORIES_CONTENT');
}

/** Structures that are lookup tables or display helpers, not story content. */
const NOT_STORY_CONTENT = new Set([
  'THEME_ID_TO_STORY_KEY', // theme id → story key mapping; platform vocabulary
  'THEME_PRIORITY', // ordering rule, identical for every tenant
  'SOCIAL_DISPLAY', // derived display strings, computed from content
  'CORE_FACTS_CONTENT', // stored under the key CORE_FACTS
]);

describe('the stored story block is closed', () => {
  it('contains every content structure the module declares', () => {
    const stored = new Set(Object.keys(STORIES_CONTENT));
    // CORE_FACTS_CONTENT is stored under a different key.
    stored.add('CORE_FACTS_CONTENT');

    const missing = declaredContentBlocks().filter(
      (name) => !stored.has(name) && !NOT_STORY_CONTENT.has(name),
    );

    expect(
      missing,
      'These feed a composed Gesuch but do not travel to org_content, so a ' +
        'tenant reading the stored block would fall back to this organisation ' +
        `for them: ${missing.join(', ')}`,
    ).toEqual([]);
  });

  it('the exemption list has no stale entries', () => {
    const declared = new Set(declaredContentBlocks());
    const stale = [...NOT_STORY_CONTENT].filter((n) => !declared.has(n));
    expect(stale, `Exempted but no longer declared: ${stale.join(', ')}`).toEqual([]);
  });

  it('finds the module, so the check is not vacuous', () => {
    expect(declaredContentBlocks().length).toBeGreaterThan(5);
  });
});
