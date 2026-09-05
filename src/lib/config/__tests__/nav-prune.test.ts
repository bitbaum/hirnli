/**
 * A tenant's menu offers only pages that tenant has.
 *
 * The nav was one static list for everybody, so the second tenant's menu
 * offered eight pages of another organisation's content — including a route
 * named after the reference tenant's own project. Pruning is a courtesy, not a
 * boundary: every page keeps its own gate, because a link can be typed by hand.
 */

import { describe, it, expect } from 'vitest';
import { buildNavStructure } from '../nav';

const allHrefs = (structure: ReturnType<typeof buildNavStructure>): string[] => [
  ...structure.items.flatMap((i) => [
    ...(i.href ? [i.href] : []),
    ...(i.children ?? []).map((c) => c.href),
    ...(i.sections ?? []).flatMap((s) => s.items.map((l) => l.href)),
  ]),
];

describe('navigation is built from what the tenant has', () => {
  it('hides nothing when nothing is hidden', () => {
    const full = buildNavStructure(10);
    expect(allHrefs(full)).toContain('/finanzen');
    expect(allHrefs(full)).toContain('/team');
  });

  it('removes a hidden link from a simple child list', () => {
    const pruned = buildNavStructure(10, ['/finanzen']);
    expect(allHrefs(pruned)).not.toContain('/finanzen');
    expect(allHrefs(pruned)).toContain('/team');
  });

  it('removes a hidden link from a MEGA-MENU section', () => {
    // Both shapes exist and are pruned differently; handling only `children`
    // left the mega menu still offering pages the tenant does not have.
    const full = buildNavStructure(10);
    const megaHrefs = full.items.flatMap((i) =>
      (i.sections ?? []).flatMap((s) => s.items.map((l) => l.href)),
    );
    expect(megaHrefs.length, 'no mega-menu links to test against').toBeGreaterThan(0);

    const target = megaHrefs[0];
    expect(allHrefs(buildNavStructure(10, [target]))).not.toContain(target);
  });

  it('drops a top-level item once every child is hidden', () => {
    const full = buildNavStructure(10);
    const item = full.items.find((i) => (i.children?.length ?? 0) > 1 && !i.href);
    expect(item, 'expected a childrened item with no href of its own').toBeDefined();

    const pruned = buildNavStructure(
      10,
      item!.children!.map((c) => c.href),
    );
    expect(pruned.items.some((i) => i.msg === item!.msg)).toBe(false);
  });

  it('drops a top-level item whose own href is hidden', () => {
    const pruned = buildNavStructure(10, ['/dokumente']);
    expect(pruned.items.some((i) => i.href === '/dokumente')).toBe(false);
  });

  it('never hides the platform entry, which belongs to no tenant', () => {
    const pruned = buildNavStructure(10, ['/finanzen', '/team', '/wirkung']);
    expect(allHrefs(pruned)).toContain('/plattform');
  });
});
