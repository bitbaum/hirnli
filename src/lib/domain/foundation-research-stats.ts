import type { Foundation, ThemeId } from '../schemas/foundation';

// ---------------------------------------------------------------------------
// Vollstaendigkeit & Recherche-Statistiken
// ---------------------------------------------------------------------------
// Reine Funktionen fuer die Analyse des Recherche-Stands aller Stiftungen.
// computeCompleteness wurde aus FoundationSidebar extrahiert (SSOT).
// ---------------------------------------------------------------------------

/** Felder-Checks fuer die Datenvollstaendigkeit einer Stiftung */
const COMPLETENESS_CHECKS: ((f: Foundation) => [label: string, filled: boolean])[] = [
  (f) => ['Name', !!f.name],
  (f) => ['Website', !!f.websiteUrl],
  (f) => ['Themen', f.themes.length > 0],
  (f) => ['Bewerbungsweg', f.applicationMethod !== 'unknown'],
  (f) => ['Bewerbungs-URL', !!f.applicationUrl],
  (f) => ['Förderbetrag', f.amount.min !== null || f.amount.max !== null],
  (f) => ['Stiftungszweck', !!f.purposeSummary],
  (f) => ['Jahresbudget', !!f.annualBudget],
  (f) => ['Gründungsjahr', !!f.founded],
  (f) => ['Kontakt', !!(f.contact?.email || f.contact?.address)],
  (f) => ['UID', !!f.uid],
  (f) => ['Region', !!f.region],
  (f) => ['Stiftungsrat', !!(f.boardMembers && f.boardMembers.length > 0)],
  (f) => ['Vermögen', !!f.capital],
];

// ---------------------------------------------------------------------------
// computeCompleteness
// ---------------------------------------------------------------------------

/**
 * Berechnet die Datenvollstaendigkeit einer einzelnen Stiftung.
 * Gibt den Prozentsatz und die Liste fehlender Felder zurueck.
 *
 * Extrahiert aus FoundationSidebar — dort nur noch importieren.
 */
export function computeCompleteness(f: Foundation): { percent: number; missing: string[] } {
  const results = COMPLETENESS_CHECKS.map((check) => check(f));
  const filled = results.filter(([, ok]) => ok).length;
  const missing = results.filter(([, ok]) => !ok).map(([label]) => label);
  return { percent: Math.round((filled / results.length) * 100), missing };
}

// ---------------------------------------------------------------------------
// ResearchStats
// ---------------------------------------------------------------------------

export interface ResearchStats {
  /** Gesamtzahl der Stiftungen */
  total: number;
  /** Anzahl recherchierter Stiftungen (purposeSummary vorhanden UND needsResearch !== true) */
  researched: number;
  /** Recherchiert in Prozent */
  researchedPercent: number;
  /** Anzahl mit veraltetem researchDate (aelter als staleDays) */
  stale: number;
  /** Durchschnittliche Datenvollstaendigkeit in Prozent */
  avgCompleteness: number;
  /** Verteilung nach Qualitaet: >75% hoch, 40-75% mittel, <40% tief */
  qualityDistribution: { high: number; medium: number; low: number };
  /** Heatmap: Feldname → Anzahl Stiftungen denen dieses Feld fehlt */
  missingFieldsHeatmap: Record<string, number>;
  /** Aufschluesselung nach Typ (A/B/C/D/network) */
  byType: Record<string, { total: number; researched: number }>;
  /** Aufschluesselung nach Fit-Score (1/2/3) */
  byFit: Record<number, { total: number; researched: number }>;
  /** Aufschluesselung nach Thema */
  byTheme: Record<string, { total: number; researched: number }>;
}

/** Ob eine Stiftung als "recherchiert" gilt */
function isResearched(f: Foundation): boolean {
  return !!f.purposeSummary && !f.needsResearch;
}

/** Ob das researchDate aelter als daysThreshold Tage ist */
function isStale(f: Foundation, now: Date, daysThreshold: number): boolean {
  if (!f.researchDate) return true;
  const researchMs = new Date(f.researchDate).getTime();
  const thresholdMs = now.getTime() - daysThreshold * 24 * 60 * 60 * 1000;
  return researchMs < thresholdMs;
}

/**
 * Berechnet umfassende Recherche-Statistiken ueber alle Stiftungen.
 *
 * @param foundations - Alle Stiftungen
 * @param staleDays - Ab wie vielen Tagen gilt ein researchDate als veraltet (Standard: 90)
 */
export function computeResearchStats(
  foundations: readonly Foundation[],
  staleDays = 90,
): ResearchStats {
  const now = new Date();
  const total = foundations.length;

  if (total === 0) {
    return {
      total: 0,
      researched: 0,
      researchedPercent: 0,
      stale: 0,
      avgCompleteness: 0,
      qualityDistribution: { high: 0, medium: 0, low: 0 },
      missingFieldsHeatmap: {},
      byType: {},
      byFit: {},
      byTheme: {},
    };
  }

  let researched = 0;
  let stale = 0;
  let totalCompleteness = 0;
  const quality = { high: 0, medium: 0, low: 0 };
  const missingFieldsHeatmap: Record<string, number> = {};
  const byType: Record<string, { total: number; researched: number }> = {};
  const byFit: Record<number, { total: number; researched: number }> = {};
  const byTheme: Record<string, { total: number; researched: number }> = {};

  for (const f of foundations) {
    const fResearched = isResearched(f);
    if (fResearched) researched++;
    if (isStale(f, now, staleDays)) stale++;

    // Vollstaendigkeit
    const { percent, missing } = computeCompleteness(f);
    totalCompleteness += percent;

    // Qualitaetsverteilung
    if (percent > 75) quality.high++;
    else if (percent >= 40) quality.medium++;
    else quality.low++;

    // Fehlende Felder zaehlen
    for (const field of missing) {
      missingFieldsHeatmap[field] = (missingFieldsHeatmap[field] ?? 0) + 1;
    }

    // Nach Typ
    const typeKey = f.type;
    if (!byType[typeKey]) byType[typeKey] = { total: 0, researched: 0 };
    byType[typeKey].total++;
    if (fResearched) byType[typeKey].researched++;

    // Nach Fit
    if (!byFit[f.fit]) byFit[f.fit] = { total: 0, researched: 0 };
    byFit[f.fit].total++;
    if (fResearched) byFit[f.fit].researched++;

    // Nach Thema (eine Stiftung kann mehrere Themen haben)
    for (const theme of f.themes) {
      if (!byTheme[theme]) byTheme[theme] = { total: 0, researched: 0 };
      byTheme[theme].total++;
      if (fResearched) byTheme[theme].researched++;
    }
  }

  return {
    total,
    researched,
    researchedPercent: Math.round((researched / total) * 100),
    stale,
    avgCompleteness: Math.round(totalCompleteness / total),
    qualityDistribution: quality,
    missingFieldsHeatmap,
    byType,
    byFit,
    byTheme,
  };
}

// ---------------------------------------------------------------------------
// Hilfs-Selektoren
// ---------------------------------------------------------------------------

/**
 * Gibt Stiftungen zurueck, deren researchDate aelter als daysThreshold ist.
 * Sortiert nach aeltestem zuerst.
 */
export function getStaleFoundations(
  foundations: readonly Foundation[],
  daysThreshold = 90,
): Foundation[] {
  const now = new Date();
  return foundations
    .filter((f) => isStale(f, now, daysThreshold))
    .sort((a, b) => {
      // Aelteste zuerst — fehlende Daten ganz nach vorne
      const dateA = a.researchDate ? new Date(a.researchDate).getTime() : 0;
      const dateB = b.researchDate ? new Date(b.researchDate).getTime() : 0;
      return dateA - dateB;
    });
}

/**
 * Gibt Stiftungen zurueck, die Aufmerksamkeit brauchen:
 * Fit >= 2 UND (needsResearch ODER researchDate veraltet).
 *
 * Das sind die hochwertigen Stiftungen, bei denen wir Datenluecken haben.
 * Sortiert nach Fit (absteigend), dann Prioritaet (aufsteigend).
 */
export function getNeedsAttention(
  foundations: readonly Foundation[],
  staleDays = 90,
): Foundation[] {
  const now = new Date();
  return foundations
    .filter((f) => f.fit >= 2 && (f.needsResearch || isStale(f, now, staleDays)))
    .sort((a, b) => {
      // Hoechster Fit zuerst
      if (b.fit !== a.fit) return b.fit - a.fit;
      // Dann niedrigste Prioritaet (= wichtigste) zuerst
      return a.priority - b.priority;
    });
}
