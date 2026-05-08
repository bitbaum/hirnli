import type { ToCItemStatus } from './components';

// ---------------------------------------------------------------------------
// Theory of Change data
// ---------------------------------------------------------------------------

interface ToCColumnData {
  title: string;
  color: string;
  titleColor: string;
  items: { label: string; status: ToCItemStatus }[];
}

export const TOC_COLUMNS: ToCColumnData[] = [
  {
    title: 'Inputs',
    color: 'bg-primary/5 border-primary/20',
    titleColor: 'text-primary',
    items: [
      { label: 'Gebrauchte Hardware', status: 'missing' },
      { label: 'Freiwillige Arbeit', status: 'missing' },
      { label: 'Open-Source-Software', status: 'measured' },
      { label: 'Spenden', status: 'measured' },
    ],
  },
  {
    title: 'Aktivitäten',
    color: 'bg-yellow-bg border-yellow/30',
    titleColor: 'text-yellow-text',
    items: [
      { label: 'Refurbishment', status: 'missing' },
      { label: 'Linux-Installation', status: 'missing' },
      { label: 'Workshops', status: 'missing' },
      { label: 'Beratung', status: 'missing' },
    ],
  },
  {
    title: 'Outputs',
    color: 'bg-amber-bg border-amber/30',
    titleColor: 'text-amber-text',
    items: [
      { label: 'Verkaufte Geräte', status: 'estimated' },
      { label: 'Einnahmen', status: 'measured' },
      { label: 'Kursteilnehmer', status: 'missing' },
      { label: 'Integration', status: 'missing' },
    ],
  },
  {
    title: 'Impact',
    color: 'bg-success/5 border-success/20',
    titleColor: 'text-success',
    items: [
      { label: 'CO₂ vermieden', status: 'estimated' },
      { label: 'E-Waste reduziert', status: 'estimated' },
      { label: 'Digitale Teilhabe', status: 'missing' },
      { label: 'Kompetenzen', status: 'missing' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Data gaps
// ---------------------------------------------------------------------------

export const DATA_GAPS = [
  { icon: '📦', title: 'Gerätezahlen', desc: 'Exakte Stückzahlen statt Schätzungen aus Umsatz' },
  { icon: '👥', title: 'Teilnehmende', desc: 'Workshop- und Praktikums-Tracking' },
  { icon: '🐧', title: 'Linux-Quote', desc: 'Anteil Open-Source-Installationen' },
  { icon: '⏱️', title: 'Freiwilligenstunden', desc: 'Zeiterfassung für ehrenamtliche Arbeit' },
] as const;

// ---------------------------------------------------------------------------
// Next steps (prioritized action items)
// ---------------------------------------------------------------------------

export const WIRKUNG_NEXT_STEPS = [
  { priority: 'high' as const, label: 'Device-Tracking aktivieren', desc: 'Stückzahlen erfassen statt aus Umsatz schätzen', impact: 'Verbessert 8 KPIs' },
  { priority: 'high' as const, label: 'Integration-Tracking starten', desc: 'Praktikant:innen und Erfolge dokumentieren', impact: 'Verbessert 4 KPIs (Kernmission!)' },
  { priority: 'medium' as const, label: 'Workshop-Tracking einführen', desc: 'Teilnehmerzahlen und Feedback erfassen', impact: 'Verbessert 3 KPIs' },
  { priority: 'low' as const, label: 'Freiwilligen-Zeiterfassung', desc: 'Optionale Stundenerfassung für Ehrenamtliche', impact: 'Verbessert Transparenz' },
] as const;
