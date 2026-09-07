/**
 * Human labels for the field paths an editor shows.
 *
 * The field list is derived from the block so nothing becomes unreachable when
 * the content grows — see `block-fields.ts`. The cost of that is paths like
 * `WHY.klima.call_to_action`, which are precise and unreadable.
 *
 * This maps the two bounded vocabularies that make a path readable: the
 * top-level sections, and the leaf names that recur across them. A path with no
 * entry falls back to its own segments, so an unlabelled field is merely plain
 * rather than missing — the failure mode of a hand-written FIELD LIST, where an
 * unlisted field simply cannot be edited, is the one worth avoiding.
 */

export const SECTION_LABELS: Record<string, { title: string; hint: string }> = {
  CORE_FACTS: {
    title: 'Eckdaten',
    hint: 'Was Ihre Organisation tut und was sie auszeichnet. Erscheint im Kurzportrait.',
  },
  GESUCH_TEXT: {
    title: 'Gesuch-Texte',
    hint: 'Die Absätze, die in jedem Gesuch wörtlich abgedruckt werden.',
  },
  WHY: {
    title: 'Warum — pro Themenfeld',
    hint: 'Das Problem und Ihre Antwort darauf. Ein Gesuch beginnt mit dem Feld, das zur Stiftung passt.',
  },
  HOW: {
    title: 'Wie — Erfahrung und Fähigkeiten',
    hint: 'Was Sie bereits geleistet haben und was Sie können. Seite 2 jedes Gesuchs.',
  },
  ANSCHREIBEN_TEMPLATES: {
    title: 'Anschreiben',
    hint: 'Einstieg und Schluss je Stiftungstyp. Wird verwendet, wenn keine persönlichere Variante möglich ist.',
  },
  PARTNER_HIGHLIGHTS: {
    title: 'Partnerschaften',
    hint: 'Zusammenarbeiten, die für Stiftungen aussagekräftig sind.',
  },
  KURZPORTRAIT_FACTS: {
    title: 'Kennzahlen im Kurzportrait',
    hint: 'Ihre eigenen Zahlen. Leer lassen, solange nichts gemessen ist — erfundene Zahlen liest eine Stiftung als Ergebnis.',
  },
  PROJECTS: { title: 'Projekte', hint: 'Vorhaben, die ein Gesuch konkret beschreiben kann.' },
  EVIDENCE: { title: 'Quellen', hint: 'Studien und Belege, auf die sich Ihre Argumente stützen.' },
  ANECDOTES: {
    title: 'Anekdoten',
    hint: 'Kurze Geschichten über Menschen. Wirken stärker als Zahlen.',
  },
  PHOTO_SLOTS: {
    title: 'Bildplätze',
    hint: 'Beschreibungen der Bilder, die ein Gesuch begleiten.',
  },
};

const LEAF_LABELS: Record<string, string> = {
  headline: 'Überschrift',
  hook: 'Aufhänger',
  problem: 'Problem',
  solution: 'Lösung',
  call_to_action: 'Aufforderung',
  text: 'Text',
  label: 'Bezeichnung',
  value: 'Wert',
  description: 'Beschreibung',
  tagline: 'Kurzformel',
  opening: 'Einstieg',
  closing: 'Schluss',
  name: 'Name',
  relationship: 'Beziehung',
  since: 'Seit',
  template: 'Vorlage',
  title: 'Titel',
  claim: 'Aussage',
  url: 'Link',
  summary: 'Zusammenfassung',
  subtitle: 'Untertitel',
  track_record: 'Leistungsausweis',
  capabilities: 'Fähigkeiten',
  activities: 'Tätigkeiten',
  unique: 'Alleinstellung',
  proof_points: 'Belege',
  indicators: 'Indikatoren',
  sustainability: 'Tragfähigkeit',
  zusammenfassung_intro: 'Zusammenfassung',
  kurzportrait_subtitle: 'Kurzportrait-Untertitel',
  wirkungsmessung: 'Wirkungsmessung',
  klima: 'Klimaschutz',
  kreislaufwirtschaft: 'Kreislaufwirtschaft',
  sozial: 'Soziale Integration',
  bildung: 'Bildung',
  digital: 'Digitalisierung',
  technical: 'Technik',
  social: 'Soziales',
  environmental: 'Umwelt',
  network: 'Netzwerk-Kontakt',
};

/** A readable label for one field path, minus its section. */
export function fieldLabel(path: string): string {
  const segments = path.split('.').slice(1);
  if (segments.length === 0) return path;
  return segments
    .map((s) => (/^\d+$/.test(s) ? `${Number(s) + 1}.` : (LEAF_LABELS[s] ?? s.replace(/_/g, ' '))))
    .join(' · ');
}

/** The section a path belongs to. */
export function sectionOf(path: string): string {
  return path.split('.')[0];
}
