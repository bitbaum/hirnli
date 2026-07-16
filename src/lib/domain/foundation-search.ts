// Foundation Search — Fuzzy search with weighted relevance scoring
// Uses fitScore (stored) and tier (computed) in relevance weighting.

import Fuse, { type IFuseOptions } from 'fuse.js';
import type { Foundation, ThemeId } from '@/lib/schemas/foundation';
import { isResearched } from './foundation-helpers';

// ---------------------------------------------------------------------------
// Gewichtung fuer die zusammengesetzte Relevanzbewertung
// ---------------------------------------------------------------------------
const SEARCH_WEIGHTS = {
  textRelevance: 0.40,
  fitScore: 0.25,
  priority: 0.15,
  researchCompleteness: 0.10,
  themeOverlap: 0.10,
} as const;

// ---------------------------------------------------------------------------
// Fuse.js Konfiguration — welche Felder durchsucht werden und wie scharf
// ---------------------------------------------------------------------------
const FUSE_CONFIG: IFuseOptions<Foundation> = {
  keys: [
    { name: 'name', weight: 0.35 },
    { name: 'tagline', weight: 0.20 },
    { name: 'purposeSummary', weight: 0.25 },
    { name: 'researchNotes', weight: 0.10 },
    { name: 'region', weight: 0.10 },
  ],
  threshold: 0.4,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
};

// ---------------------------------------------------------------------------
// Typen
// ---------------------------------------------------------------------------
interface ScoredFoundation {
  foundation: Foundation;
  /** Zusammengesetzter Score 0-1, hoeher = besser */
  score: number;
  /** Roher Fuse-Score (0 = perfekt, 1 = schlechtester Treffer) */
  fuseScore?: number;
  /** Hervorgehobene Treffer fuer UI-Darstellung */
  matchHighlights?: { key: string; indices: readonly [number, number][] }[];
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/**
 * Berechnet den zusammengesetzten Relevanz-Score (0-1, hoeher = besser).
 *
 * Kombiniert Textrelevanz, Fit-Bewertung, Prioritaet, Recherche-Vollstaendigkeit
 * und Themen-Ueberlappung (Jaccard-Index) zu einem einzelnen Wert.
 */
function computeRelevanceScore(
  foundation: Foundation,
  fuseScore: number,
  activeThemes?: ThemeId[],
): number {
  // Textrelevanz: Fuse liefert 0 = perfekt, 1 = schlechtester — invertieren
  const textRelevance = (1 - fuseScore) * SEARCH_WEIGHTS.textRelevance;

  // Fit-Score: 0-10 Skala, normalisiert auf 0-1
  const fitScore = (foundation.fitScore / 10) * SEARCH_WEIGHTS.fitScore;

  // Prioritaet: stored P1-P4, normalize to 0-1 (P1=1.0, P2=0.75, P3=0.5, P4=0.25)
  const priority = ((5 - foundation.priority) / 4) * SEARCH_WEIGHTS.priority;

  // Recherche-Vollstaendigkeit: binaer — hat purposeSummary und braucht keine Recherche mehr
  const researchCompleteness =
    (foundation.purposeSummary && isResearched(foundation) ? 1 : 0) *
    SEARCH_WEIGHTS.researchCompleteness;

  // Themen-Ueberlappung: Jaccard-Index zwischen aktiven Themen und Stiftungsthemen
  let themeOverlap = 0;
  if (activeThemes && activeThemes.length > 0 && foundation.themes.length > 0) {
    const foundationSet = new Set(foundation.themes);
    const activeSet = new Set(activeThemes);

    const intersection = activeThemes.filter((t) => foundationSet.has(t)).length;
    // Vereinigung = beide Sets zusammen, ohne Duplikate
    const union = new Set([...foundationSet, ...activeSet]).size;

    themeOverlap = (intersection / union) * SEARCH_WEIGHTS.themeOverlap;
  }

  return textRelevance + fitScore + priority + researchCompleteness + themeOverlap;
}

// ---------------------------------------------------------------------------
// Suchindex erstellen
// ---------------------------------------------------------------------------

/** Erstellt eine Fuse-Instanz fuer die Stiftungssuche */
export function createSearchIndex(foundations: Foundation[]): Fuse<Foundation> {
  return new Fuse(foundations, FUSE_CONFIG);
}

// ---------------------------------------------------------------------------
// Suche ausfuehren
// ---------------------------------------------------------------------------

/**
 * Durchsucht Stiftungen mit Fuzzy-Matching und gibt gewichtete Resultate zurueck.
 *
 * Falls keine Fuse-Instanz uebergeben wird, wird eine neue erstellt.
 * Resultate sind nach zusammengesetztem Score absteigend sortiert.
 */
export function searchFoundations(
  foundations: Foundation[],
  query: string,
  activeThemes?: ThemeId[],
  fuseInstance?: Fuse<Foundation>,
): ScoredFoundation[] {
  // Leere Suche = keine Resultate. Nicht der Library überlassen —
  // fuse.js hat dieses Verhalten zwischen Versionen geändert (7.1 → 7.5).
  if (query.trim() === '') return [];

  const fuse = fuseInstance ?? createSearchIndex(foundations);
  const results = fuse.search(query);

  return results
    .map((result) => {
      const fuseScore = result.score ?? 1;

      // Match-Highlights fuer die UI extrahieren
      const matchHighlights = result.matches?.map((match) => ({
        key: match.key ?? '',
        indices: match.indices as readonly [number, number][],
      }));

      return {
        foundation: result.item,
        score: computeRelevanceScore(result.item, fuseScore, activeThemes),
        fuseScore,
        matchHighlights,
      };
    })
    .sort((a, b) => b.score - a.score);
}
