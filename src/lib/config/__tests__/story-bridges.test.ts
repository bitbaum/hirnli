/**
 * A page a tenant cannot show must not be advertised on its front page.
 *
 * The homepage computed the unauthored routes, filtered its call-to-action
 * links with them, and then rendered the story bridges unfiltered three lines
 * below. So the second customer's front page offered "Detaillierte
 * Finanzanalyse ansehen" and "Unsere Wirkung in Zahlen", and both answered that
 * the organisation has published nothing — found by opening the site rather
 * than by reading the HTML, which is the only way this kind of thing shows up.
 */

import { describe, it, expect } from 'vitest';
import { getStoryBridges, STORY_BRIDGES } from '../story-bridges';

describe('story bridges respect what a tenant has published', () => {
  it('drops a bridge whose destination is unauthored', () => {
    const all = getStoryBridges('dashboard', new Set());
    expect(all.length).toBeGreaterThan(0);

    const hidden = new Set([all[0].href]);
    const shown = getStoryBridges('dashboard', hidden);

    expect(shown.map((b) => b.href)).not.toContain(all[0].href);
    expect(shown).toHaveLength(all.length - 1);
  });

  it('hides every bridge when a tenant has published nothing', () => {
    // The state a customer is in on day one. An empty section renders as
    // nothing at all — `StoryBridge` returns null for an empty list — rather
    // than as a heading over three dead ends.
    const everything = new Set(Object.values(STORY_BRIDGES).flatMap((bs) => bs.map((b) => b.href)));
    for (const page of Object.keys(STORY_BRIDGES)) {
      expect(getStoryBridges(page, everything), page).toEqual([]);
    }
  });

  it('keeps every bridge when nothing is hidden', () => {
    for (const [page, bridges] of Object.entries(STORY_BRIDGES)) {
      expect(getStoryBridges(page, new Set()), page).toHaveLength(bridges.length);
    }
  });
});
