/**
 * Code-held content belongs to exactly one tenant, and the list only shrinks.
 *
 * Measured against production 2026-09-05: 6,502 rendered lines, 982 differing
 * between the two tenants — 85% identical. Excluding the two DB-backed pages,
 * the sixteen code-backed ones were 96.5% identical. The second tenant's
 * /finanzen showed the first tenant's eight-year P&L; /team showed fourteen of
 * its colleagues by name.
 *
 * `CODE_OWNED` names the pages still in that state. It is a ratchet: entries
 * leave as content moves into `org_content`, and nothing may be added, so a new
 * page cannot quietly hard-code one organisation's material and serve it to
 * everybody.
 */

import { describe, it, expect } from 'vitest';
import { CODE_CONTENT_OWNER, CODE_OWNED, TENANT_PAGES, ownsCodeContent } from '../page-content';
import { DEFAULT_TENANT_ID } from '@/lib/tenant/registry';

describe('code-held content has exactly one owner', () => {
  it('the owner sees it', async () => {
    for (const page of CODE_OWNED) {
      expect(await ownsCodeContent(page, CODE_CONTENT_OWNER), `${page}`).toBe(true);
    }
  });

  it('nobody else does — not even the fallback tenant, if they ever differ', async () => {
    // The failure this prevents: `evig` requesting /finanzen and receiving the
    // reference tenant's profit-and-loss under its own name.
    for (const page of CODE_OWNED) {
      expect(await ownsCodeContent(page, 'evig'), `${page} leaked to a second tenant`).toBe(false);
      expect(await ownsCodeContent(page, 'some-new-customer'), `${page}`).toBe(false);
    }
  });

  it("a page not in the list is nobody's, including the owner's", async () => {
    // Removing an entry must actually stop serving it, or the ratchet is
    // decorative: a migrated page whose reader still falls through to code
    // would look migrated and behave exactly as before.
    const notOwned = TENANT_PAGES.filter((p) => !CODE_OWNED.includes(p));
    for (const page of notOwned) {
      expect(await ownsCodeContent(page, CODE_CONTENT_OWNER), `${page}`).toBe(false);
    }
  });

  it('every owned page is a declared tenant page', () => {
    const undeclared = CODE_OWNED.filter((p) => !TENANT_PAGES.includes(p));
    expect(undeclared, `not in TENANT_PAGES: ${undeclared.join(', ')}`).toEqual([]);
  });

  it('the content owner is stated separately from the host fallback', () => {
    // They are the same organisation today and mean different things: one is
    // "who do we serve when the Host is unknown", the other "whose facts are
    // hard-coded in this repository". Conflating them is how the fallback
    // tenant silently became the content tenant. This asserts the two
    // constants exist independently, not that they differ.
    expect(CODE_CONTENT_OWNER).toBe('revamp-it');
    expect(typeof DEFAULT_TENANT_ID).toBe('string');
  });

  it('the ratchet may not grow', () => {
    // Update this number DOWNWARD as pages migrate to org_content. If a change
    // makes it rise, a new page has hard-coded one tenant's content.
    expect(CODE_OWNED.length).toBeLessThanOrEqual(12);
  });
});
