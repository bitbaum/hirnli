/**
 * Wie wir arbeiten — Page constants
 *
 * ORG-SPECIFIC: metrics and framing are Revamp-IT specific.
 */

export const PAGE_TITLE = 'Wie wir arbeiten';
export const PAGE_SUBTITLE =
  'Die Wertschöpfungskaskade — maximale Wertschöpfung pro Gerät';

export const WHY_THIS_MATTERS = {
  purpose:
    'Zeigt, wie Revamp-IT aus jeder Spende das Maximum herausholt: Refurbishing → Ersatzteile → Recycling.',
  connection:
    'Diese Methode erklärt, warum unsere Wirkungszahlen (CO₂, Geräte, Lebensdauer) so hoch sind — und was der Community Tech Space zusätzlich ermöglicht.',
};

export const CASCADE_METRICS = [
  {
    value: '~60%',
    label: 'Vollständig refurbished',
    detail: 'Diagnose → Upgrade → Linux → QA → Verkauf',
  },
  {
    value: '~25%',
    label: 'Ersatzteile gewonnen',
    detail: 'Komponenten fliessen zurück in Refurbishing',
  },
  {
    value: '~15%',
    label: 'Fachgerecht recycelt',
    detail: 'Nur der absolute Rest (SWICO-zertifiziert)',
  },
  {
    value: '5+ Jahre',
    label: 'Lebensdauer verlängert',
    detail: 'Pro refurbishtem Gerät',
  },
] as const;
