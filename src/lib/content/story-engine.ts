/**
 * The mechanism that turns one organisation's story into a Gesuch.
 *
 * This file is the other half of the seam `stories-source.ts` opens. That one
 * answers "whose story is this and where does it live"; this one answers "what
 * do you do with a story", and it holds no story of its own — not a sentence,
 * not a metric, not a partner name. Everything it works on arrives as an
 * argument.
 *
 * That split is the whole point. The functions here used to live in
 * `src/lib/config/stories.ts` alongside the content, closing over it: you
 * called `composeStory('klima', [])` and got one organisation's WHY section,
 * because there was only one WHY in scope and no parameter through which
 * another could arrive. Every composer that called it inherited that limit
 * silently — the code read as general, and was specific.
 *
 * A `TenantStory` binds a block to the tenant it belongs to, so a composer
 * cannot accidentally write one organisation's story under another's name: it
 * has no access to a block except through the object that also carries the
 * name, and interpolation happens on the way out.
 */

import type { Foundation, ThemeId } from '@/lib/schemas/foundation';
import type {
  Anecdote,
  CompetencySection,
  CoreFacts,
  Evidence,
  KurzportraitFact,
  PhotoSlot,
  Project,
  WhySection,
} from '@/lib/schemas/story';
import type { Tenant } from '@/lib/tenant/profile';
import { fillContentWith, templateValues } from '@/lib/content/interpolate';
import { getStoriesBlock, type StoriesBlock } from './stories-source';
import { THEME_COMPETENCY, type ThemeKey } from './story-themes';

// Re-exported so a caller that already has the engine does not need a second
// import for the vocabulary it is written in.
export { THEME_ID_TO_STORY_KEY, THEME_PRIORITY, type ThemeKey } from './story-themes';

/**
 * A competency with its citations already resolved.
 *
 * `evidence` holds keys into the story's own citation registry, and the two
 * renderers that show sources used to resolve them by importing a lookup — the
 * last thing in a Gesuch renderer still reaching into content, and therefore
 * the last one that could cite one organisation's sources in another's
 * document. Resolving at composition means a renderer receives citations rather
 * than the means to go looking for some.
 */
export type ComposedCompetency = CompetencySection & { citations: Evidence[] };

export interface ComposedStory {
  why: WhySection | undefined;
  how: { track_record: StoriesBlock['HOW']['track_record']; competencies: ComposedCompetency[] };
  projects: Project[];
  evidence: Evidence[];
}

/**
 * One organisation's story, bound to that organisation.
 *
 * Every accessor returns content with placeholders already filled, so no caller
 * has to remember to interpolate and no caller can forget. `raw` exists for the
 * one case that must not be filled — seeding another tenant's starter row from
 * this shape — and is named to make that use conspicuous.
 */
export interface TenantStory {
  readonly tenant: Tenant;
  readonly raw: StoriesBlock;
  /** Prose blocks rendered verbatim into the Gesuch. */
  gesuchText(): StoriesBlock['GESUCH_TEXT'];
  /** Identity from the tenant, programme facts from the story. */
  coreFacts(): CoreFacts;
  /** The cover-letter opening and closing for a foundation of this type. */
  anschreibenTemplate(type: Foundation['type']): { opening: string; closing: string };
  partnerHighlights(): StoriesBlock['PARTNER_HIGHLIGHTS'];
  /** The organisation's own headline figures, for the Kurzportrait table. */
  kurzportraitFacts(): KurzportraitFact[];
  why(theme: ThemeKey): WhySection | undefined;
  anecdotes(theme: ThemeKey, placement: 'why' | 'how'): Anecdote[];
  photoSlots(placement: PhotoSlot['placement'], theme?: ThemeKey): PhotoSlot[];
  findEvidence(key: string): Evidence | null;
  compose(primary: ThemeKey, secondary?: ThemeKey[]): ComposedStory;
  /**
   * Fill every placeholder in an already-composed value.
   *
   * The composers assemble a Gesuch from a dozen sources and several are
   * reached indirectly. Filling each at its own call site means every future
   * source is a chance to forget one, and a forgotten one ships as
   * "über {{yearsActive}} Jahre" in a document sent to a foundation. So the
   * whole assembled tree is filled once, at the end.
   */
  fill<T>(value: T): T;
}

export function tenantStory(tenant: Tenant, block: StoriesBlock): TenantStory {
  // `teamSize` and the metrics are filled from the story rather than the tenant
  // vocabulary because they are facts about the organisation's programme, not
  // its identity — the same reason they are stored in the block and not the
  // profile.
  //
  // Flattening the metrics into the vocabulary is what lets a Kurzportrait row
  // cite a figure instead of copying it. A copied figure is a second source of
  // truth that nothing keeps in step, and the place it surfaces is a document
  // already posted to a funder.
  const metricValues: Record<string, string> = {};
  for (const [group, entries] of Object.entries(block.CORE_FACTS.metrics)) {
    for (const [key, value] of Object.entries(entries as Record<string, unknown>)) {
      metricValues[`metrics.${group}.${key}`] = String(value);
    }
  }
  const values = () => ({
    ...templateValues(tenant),
    ...metricValues,
    teamSize: String(block.CORE_FACTS.team_size),
  });
  const fill = <T>(value: T): T => fillContentWith(value, values());

  const projectsByTheme = (theme: string): Project[] =>
    Object.values(block.PROJECTS).filter((p) => p.themes.includes(theme));

  const findEvidence = (key: string): Evidence | null => {
    for (const category of Object.keys(block.EVIDENCE)) {
      const hit = block.EVIDENCE[category][key];
      if (hit) return hit;
    }
    return null;
  };

  return {
    tenant,
    raw: block,
    fill,
    gesuchText: () => fill(block.GESUCH_TEXT),
    coreFacts: () => {
      const { team_size, ...content } = block.CORE_FACTS;
      return {
        ...fill(content),
        organization: {
          name: tenant.name,
          legalForm: tenant.legalForm,
          founded: tenant.founded,
          location: tenant.location,
          // Optional on a tenant, required by the schema this renders into: an
          // organisation with neither gets an empty string and the Kurzportrait
          // already drops empty rows.
          address: tenant.address ?? '',
          website: tenant.website ?? '',
          team_size,
        },
      };
    },
    anschreibenTemplate: (type) => fill(block.ANSCHREIBEN_TEMPLATES[type]),
    partnerHighlights: () => fill(block.PARTNER_HIGHLIGHTS),
    kurzportraitFacts: () => fill(block.KURZPORTRAIT_FACTS),
    why: (theme) => block.WHY[theme],
    anecdotes: (theme, placement) =>
      block.ANECDOTES.filter((a) => a.placement === placement && a.themes.includes(theme)),
    photoSlots: (placement, theme) =>
      block.PHOTO_SLOTS.filter(
        (p) => p.placement === placement && (!p.themes || !theme || p.themes.includes(theme)),
      ),
    findEvidence,
    compose: (primary, secondary = []) => {
      const allThemes = [primary, ...secondary];
      const why = block.WHY[primary];
      return {
        why,
        how: {
          track_record: block.HOW.track_record,
          competencies: allThemes
            .map((t) => block.HOW[THEME_COMPETENCY[t]] as CompetencySection)
            .filter((c, i, arr): c is CompetencySection => Boolean(c) && arr.indexOf(c) === i)
            .map((c) => ({
              ...c,
              citations: (c.evidence ?? [])
                .map((key) => findEvidence(key))
                .filter((e): e is Evidence => e !== null),
            })),
        },
        projects: [...new Set(allThemes.flatMap((t) => projectsByTheme(t)))],
        evidence:
          why?.evidence?.map((key) => findEvidence(key)).filter((e): e is Evidence => e !== null) ??
          [],
      };
    },
  };
}

/**
 * This tenant's story, or null if it has not written one.
 *
 * Null is a normal state, not an error: a customer who signed up an hour ago
 * has no story yet, and the honest thing to show them is their own empty page
 * with a way to fill it. What must never happen is the alternative this
 * function exists to prevent — composing a grant application from whichever
 * story happened to be in scope.
 */
export async function loadTenantStory(tenant: Tenant): Promise<TenantStory | null> {
  const block = await getStoriesBlock(tenant);
  return block ? tenantStory(tenant, block) : null;
}

/** Themes this tenant has actually written a WHY section for. */
export function authoredThemes(story: TenantStory): ThemeKey[] {
  return (Object.keys(THEME_COMPETENCY) as ThemeKey[]).filter((t) => story.why(t) !== undefined);
}
