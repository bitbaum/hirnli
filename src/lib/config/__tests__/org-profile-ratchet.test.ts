/**
 * `ORG_PROFILE` is a compile-time constant describing ONE organisation, in a
 * product that has more than one. Every module still reading it renders that
 * organisation's facts for whoever is looking — which is how another tenant's
 * postal address, phone number and founding year reached pages that were not
 * theirs.
 *
 * The file is on its way out. Until it is gone, this is a ratchet: the set of
 * modules importing it may SHRINK and may not GROW. Both directions are
 * asserted, and that is the point — a list that only forbids additions rots
 * into a list of files that stopped importing it years ago, and then nobody
 * trusts it enough to delete an entry.
 *
 * When this list is empty, delete `org-profile.ts` and this test with it.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

/**
 * Still reads the single-tenant constant. Shrink me.
 *
 * Each entry says what has to happen for it to go, so the list is a work plan
 * rather than a permission slip.
 */
const STILL_READS_ORG_PROFILE: Record<string, string> = {
  // CORRECTION. An earlier version of this list said these follow `stories.ts`
  // — `{{placeholder}}` text plus a resolve(tenant). That is wrong, and acting
  // on it would make things worse.
  //
  // `stories.ts` is PROSE: "a charity founded in {{founded}}" is true of any
  // tenant once the year is a slot. These files are one organisation's MEASURED
  // DATA — 1'200 laptops refurbished, 847 of them documented in an accounting
  // system, an internship programme that began in a particular year. Filling
  // `{{founded}}` into their labels would print the VIEWING tenant's founding
  // year over the FIRST tenant's counts: "1'200+ Laptops refurbished
  // (2026-2025)". The reference to `ORG_PROFILE` is currently the one thing
  // that keeps each label agreeing with the number beside it.
  //
  // So these do not need templating. They need per-tenant rows, and a tenant
  // without them must render nothing rather than another's — the same rule
  // `parseBranding` already follows for logos. That is a content-authoring
  // decision, not a refactor, and it is the real blocker.
  'src/lib/config/numbers.ts': 'ONE TENANT DATA — needs per-tenant rows, not templating',
  'src/lib/config/metrics.ts': 'ONE TENANT DATA — needs per-tenant rows, not templating',
  'src/lib/config/projections.ts': 'derived from numbers.ts; migrates with it',
  'src/app/(tenant)/strategie/data.ts': 'ONE TENANT DATA — needs per-tenant rows',

  // Not a migration target: this test EXISTS to prove the constant's shape is
  // rejected by the stored-profile schema, so it has to import the thing.
  'src/lib/tenant/__tests__/profile.test.ts': 'asserts the schema rejects it — keep',
};

function importers(): string[] {
  // Match the IMPORT, not the path. A `grep -l` for the module path also hits
  // this file, whose entire content is the path written out — and it must match
  // across lines, because a multi-line `import { … }` reads as clean to a
  // line-anchored grep. A detector blind to how the code is actually written is
  // worse than none, because it passes.
  const files = execSync(
    "grep -rl \"org-profile'\" src/ scripts/ --include='*.ts' --include='*.tsx' || true",
    { encoding: 'utf-8' },
  )
    .split('\n')
    .filter(Boolean)
    .filter((f) => f !== 'src/lib/config/org-profile.ts');

  const IMPORTS_IT = /import\s+(?:type\s+)?\{[^}]*\}\s*from\s*'(?:@\/lib\/config|\.)\/org-profile'/;

  return files.filter((f) => IMPORTS_IT.test(readFileSync(f, 'utf-8'))).sort();
}

describe('the single-tenant constant only loses readers', () => {
  it('no module starts reading ORG_PROFILE', () => {
    const added = importers().filter((f) => !(f in STILL_READS_ORG_PROFILE));

    expect(
      added,
      'ORG_PROFILE describes one organisation. New code takes a `Tenant` — ' +
        'see resolveStories() in src/lib/config/stories.ts for the pattern. ' +
        `Newly importing it: ${added.join(', ')}`,
    ).toEqual([]);
  });

  it('the list has no entries that already migrated', () => {
    const current = new Set(importers());
    const stale = Object.keys(STILL_READS_ORG_PROFILE).filter((f) => !current.has(f));

    expect(
      stale,
      `No longer reads ORG_PROFILE — delete from the list: ${stale.join(', ')}`,
    ).toEqual([]);
  });

  it('the platform layer does not read a tenant at all', () => {
    // The product pages describe the PLATFORM. Reaching for a tenant constant
    // there made `/plattform` unrenderable without one, and put a specific
    // customer's name in sentences that are about the platform's own history.
    // That history now lives in PLATFORM_BRAND.foundingOrg, where it is true
    // for every tenant.
    const platform = importers().filter(
      (f) =>
        f.startsWith('src/app/(platform)/') ||
        f.startsWith('src/components/platform/') ||
        f.startsWith('src/lib/config/platform-'),
    );

    expect(platform, `Platform layer reads tenant identity: ${platform.join(', ')}`).toEqual([]);
  });
});
