// Dimension config — SSOT for how dimensions are displayed
export const DIMENSIONS = [
  { id: 'financial', label: 'Finanzielle Nachhaltigkeit', icon: '💰', color: 'border-l-primary', headerBg: 'bg-primary/10', category: 'financial', status: 'Live-Daten', statusVariant: 'live' as const },
  { id: 'environmental', label: 'Ökologische Wirkung', icon: '🌍', color: 'border-l-success', headerBg: 'bg-success-bg', category: 'environmental', status: 'Schätzungen', statusVariant: 'estimated' as const },
  { id: 'social', label: 'Soziale Integration', icon: '🤝', color: 'border-l-purple-500', headerBg: 'bg-purple-50', category: 'social', status: 'Kernmission', statusVariant: 'none' as const },
] as const;

// KPIs that exist as targets but have no data in NumberSources — shown as placeholders
export const MISSING_KPIS = {
  social_integration: [
    { label: 'Aktive Teilnehmende', target: '2-4/Monat' },
    { label: 'Integrationsstunden', target: '150-300 Std./Monat' },
    { label: 'Skill-Entwicklung', target: '3.5 (1-5 Skala)' },
    { label: 'Erfolgsquote', target: '40%' },
  ],
  education: [
    { label: 'Workshops durchgeführt', target: '1-2/Monat' },
    { label: 'Teilnehmende', target: '15-25/Monat' },
    { label: 'Lernstunden vermittelt', target: '30-60 Std./Monat' },
  ],
  digital: [
    { label: 'Linux-Installationen', target: '20-25/Monat' },
    { label: 'Aktive Linux-Nutzer', target: '40/Monat' },
  ],
  operations: [
    { label: 'Geräteeingang', target: '40-60/Monat' },
    { label: 'Ø Lagerdauer', target: '≤30 Tage' },
    { label: 'Verarbeitungsquote', target: '80%' },
    { label: 'Lagerbestand', target: '50-100' },
  ],
};

export const MISSING_DIMENSIONS = [
  { id: 'education', label: 'Bildung & Kompetenzaufbau', icon: '📚', kpis: MISSING_KPIS.education },
  { id: 'digital', label: 'Digitale Souveränität', icon: '💻', kpis: MISSING_KPIS.digital },
  { id: 'operations', label: 'Operative Exzellenz', icon: '⚙️', kpis: MISSING_KPIS.operations },
];

export const ACTION_ITEMS = [
  { priority: 'HOCH', color: 'text-danger', action: 'Teilhabe-Tracking aktivieren (03_Teilhabe_Reintegration_Tracking.csv)', kpis: '4 Integration-KPIs', owner: 'HR/Veronica' },
  { priority: 'HOCH', color: 'text-danger', action: 'Device-Outcome-Tracking einführen (01_Device_Outcome_Tracking.csv)', kpis: '4 Öko + 4 Ops-KPIs', owner: 'Operations' },
  { priority: 'MITTEL', color: 'text-warning', action: 'Workshop-Tracking starten (04_Workshop_Tracking.csv)', kpis: '3 Bildungs-KPIs', owner: 'Events' },
  { priority: 'NIEDRIG', color: 'text-text-muted', action: 'Linux-Nutzung im Device-Tracking erfassen', kpis: '2 Digital-KPIs', owner: 'Tech' },
] as const;
