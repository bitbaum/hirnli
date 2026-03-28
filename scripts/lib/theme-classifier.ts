/**
 * Theme Classifier — Shared keyword-based theme classification
 *
 * Extracted from batch-research.ts and esa-bulk-ingest.ts to eliminate
 * DRY violation. Single source of truth for theme keyword rules.
 *
 * Used by: batch-research.ts, esa-bulk-ingest.ts, future pipeline scripts
 */

import type { ThemeId } from '../../src/lib/schemas/foundation';

// ============================================================================
// THEME RULES — Keywords that trigger theme assignment
// ============================================================================
// Weight is informational (used by screening for EV scoring, not by classifier)

export const THEME_RULES: Record<string, { keywords: string[]; weight: number }> = {
  arbeitsintegration: {
    keywords: ['arbeitsintegration', 'berufliche integration', 'arbeitsmarkt',
      'wiedereingliederung', 'beschäftigungsprogramm', 'arbeitstraining',
      'langzeitarbeitslos', 'sozialfirma', 'sozialer betrieb',
      'berufseinstieg', 'lehrstelle', 'berufsbildung', 'berufsausbildung',
      'umschulung', 'weiterbildung', 'qualifizierung',
      'sozialer arbeitsmarkt', 'beschäftigungsmassnahme',
      'sozialunternehmen', 'werkstätte'],
    weight: 3,
  },
  kreislaufwirtschaft: {
    keywords: ['kreislaufwirtschaft', 'recycling', 'wiederverwend', 'reparatur',
      'refurbish', 'ressourcenschon', 'zirkulär', 'elektroschrott', 'e-waste',
      'secondhand', 'second-hand', 'wiederaufbereitung', 'abfallvermeidung',
      'zero waste', 'materialkreislauf'],
    weight: 3,
  },
  'soziale-integration': {
    keywords: ['soziale integration', 'sozial benachteiligt',
      'migrant', 'migration', 'flüchtling', 'asyl',
      'marginalisiert', 'randgruppen',
      'existenzsicher', 'sozialhilfeempfänger',
      'arbeitsintegration', 'berufliche integration',
      'soziale teilhabe', 'chancengleichheit',
      'inklusion', 'teilhabe', 'benachteiligt',
      'armut', 'existenzsicherung'],
    weight: 2,
  },
  'digitale-bildung': {
    keywords: ['informatik', 'programmier', 'software',
      'medienkompetenz', 'it-kompetenz', 'digital literacy',
      'digitale kompetenz', 'digitale bildung',
      'ict', 'informationstechnologie', 'mint', 'stem',
      'digitale teilhabe', 'it-bildung', 'it-ausbildung'],
    weight: 2,
  },
  'digitale-souveraenitaet': {
    keywords: ['open source', 'quelloffen', 'linux', 'datensouveränität',
      'digitale selbstbestimmung', 'freie software', 'open data',
      'datensicher', 'souverän'],
    weight: 3,
  },
  klima: {
    keywords: ['klima', 'klimaschutz', 'klimawandel',
      'co2', 'kohlendioxid', 'treibhausgas', 'emission',
      'erneuerbar', 'erneuerbare energie',
      'dekarbonisier', 'energiewende'],
    weight: 1,
  },
  zuerich: {
    keywords: ['zürich', 'zürch', 'winterthur'],
    weight: 1,
  },
};

/**
 * Classify themes from purpose text + foundation name using keyword matching.
 * Includes compound rules for multi-signal detection.
 */
export function classifyThemes(purposeLower: string, nameLower: string): ThemeId[] {
  const themes: string[] = [];
  const fullText = `${nameLower} ${purposeLower}`;

  for (const [theme, rule] of Object.entries(THEME_RULES)) {
    if (rule.keywords.some(kw => fullText.includes(kw))) {
      themes.push(theme);
    }
  }

  // Compound: education + digital → digitale-bildung (STRICT: must be IT/tech education)
  if (!themes.includes('digitale-bildung')) {
    const hasEdu = ['bildung', 'ausbildung', 'weiterbildung', 'berufsbildung', 'schulung'].some(kw => fullText.includes(kw));
    const hasDig = ['informatik', 'computer', 'it-', 'software', 'programmier', 'coding'].some(kw => fullText.includes(kw));
    if (hasEdu && hasDig) themes.push('digitale-bildung');
  }

  // Compound: work + integration → arbeitsintegration (STRICT: must mention integration/reintegration)
  if (!themes.includes('arbeitsintegration')) {
    const hasWork = ['beruf', 'arbeit', 'erwerbstätig', 'beschäftig'].some(kw => fullText.includes(kw));
    const hasInt = ['arbeitsintegration', 'berufliche integration', 'eingliederung', 'wiedereingliederung'].some(kw => fullText.includes(kw));
    if (hasWork && hasInt) themes.push('arbeitsintegration');
  }

  // Compound: beschäftigung + integration → arbeitsintegration (STRICT)
  if (!themes.includes('arbeitsintegration')) {
    const hasBeschaeftigung = fullText.includes('beschäftigung');
    const hasInt = ['integration', 'eingliederung', 'massnahme'].some(kw => fullText.includes(kw));
    if (hasBeschaeftigung && hasInt) themes.push('arbeitsintegration');
  }

  // Compound: nachhaltigkeit + consumption/resource signal → kreislaufwirtschaft
  if (!themes.includes('kreislaufwirtschaft')) {
    const hasNachhaltigkeit = fullText.includes('nachhaltigkeit');
    const hasResourceSignal = ['konsum', 'ressource', 'produkt', 'kreislauf'].some(kw => fullText.includes(kw));
    if (hasNachhaltigkeit && hasResourceSignal) themes.push('kreislaufwirtschaft');
  }

  // Removed overly broad "innovation + sozial → soziale-integration" rule
  // This was causing false positives on foundations that mention "social innovation"
  // but have nothing to do with RevampIT's mission (e.g., medical research, sports)

  return themes as ThemeId[];
}

// ============================================================================
// FUNDER / OPERATOR SCORING
// ============================================================================

const FUNDER_KW = [
  'fördert', 'förderung', 'unterstützt', 'unterstützung',
  'beiträge', 'zuwendungen', 'zuschüsse', 'finanzielle hilfe',
  'projektförderung', 'stipend', 'ausricht',
  'gewährt', 'vergab', 'vergibt', 'zusprech',
  'finanziell', 'gemeinnützig',
];

const OPERATOR_KW = [
  'betreibt', 'führt', 'unterhält', 'verwaltet',
  'betrieb von', 'heim', 'klinik', 'spital',
  'pflegeheim', 'altersheim', 'werkstatt', 'wohnheim',
  'kinderheim', 'tagesstätte', 'krippe', 'trägerin',
  'museum', 'theater',
];

export function scoreFunderOperator(purpose: string): { funder: number; operator: number } {
  const p = purpose.toLowerCase();
  let funder = 0;
  let operator = 0;
  for (const kw of FUNDER_KW) { if (p.includes(kw)) funder++; }
  for (const kw of OPERATOR_KW) { if (p.includes(kw)) operator++; }
  return { funder, operator };
}

// ============================================================================
// SLUG GENERATION
// ============================================================================

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

// ============================================================================
// APPLICATION METHOD DETECTION
// ============================================================================

export function detectApplicationMethod(purpose: string): 'online' | 'email' | 'invitation' | 'unknown' {
  const p = purpose.toLowerCase();
  if (p.includes('online') && (p.includes('gesuch') || p.includes('antrag') || p.includes('bewerbung'))) return 'online';
  if (p.includes('auf einladung') || p.includes('nur auf') || p.includes('kein gesuch') || p.includes('keine bewerbung')) return 'invitation';
  if (p.includes('schriftlich') || p.includes('per mail') || p.includes('per post') || p.includes('per e-mail')) return 'email';
  return 'unknown';
}

// ============================================================================
// TYPE CLASSIFICATION (Robert Schmuki A/B/C/D)
// ============================================================================

export function classifyType(
  purpose: string,
  name: string,
  funderScore: number,
  operatorScore: number,
): 'A' | 'B' | 'C' | 'D' | 'network' {
  const p = purpose.toLowerCase();
  const n = name.toLowerCase();

  if (n.includes('ag') || n.includes('group') || n.includes('corporate') || n.includes('company')) return 'D';
  if (n.includes('verband') || n.includes('verein') || n.includes('netzwerk') || n.includes('dachverband')) return 'network';

  if (funderScore >= 3 && purpose.length > 200 && (
    p.includes('förderrichtlinien') || p.includes('programm') ||
    p.includes('bewerbungsverfahren') || p.includes('ausschreibung') || p.includes('gesuche')
  )) return 'A';

  if (funderScore >= 2 && purpose.length > 100 && (
    p.includes('famili') || n.includes('famili') ||
    /\b[A-Z][a-z]+-[A-Z][a-z]+\b/.test(name) || n.includes('-stiftung')
  )) return 'B';

  if (operatorScore >= 3) return 'network';
  return purpose.length > 200 && funderScore >= 2 ? 'B' : 'C';
}

// ============================================================================
// THEME LABELS (for display in research notes)
// ============================================================================

export const THEME_LABELS: Record<string, string> = {
  arbeitsintegration: 'berufliche Integration',
  kreislaufwirtschaft: 'Kreislaufwirtschaft',
  'soziale-integration': 'soziale Integration',
  'digitale-bildung': 'digitale Bildung',
  'digitale-souveraenitaet': 'digitale Souveränität',
  klima: 'Klimaschutz',
  zuerich: 'Region Zürich',
};
