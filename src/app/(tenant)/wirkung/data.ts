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
  {
    priority: 'high' as const,
    label: 'Device-Tracking aktivieren',
    desc: 'Stückzahlen erfassen statt aus Umsatz schätzen',
    impact: 'Verbessert 8 KPIs',
  },
  {
    priority: 'high' as const,
    label: 'Integration-Tracking starten',
    desc: 'Praktikant:innen und Erfolge dokumentieren',
    impact: 'Verbessert 4 KPIs (Kernmission!)',
  },
  {
    priority: 'medium' as const,
    label: 'Workshop-Tracking einführen',
    desc: 'Teilnehmerzahlen und Feedback erfassen',
    impact: 'Verbessert 3 KPIs',
  },
  {
    priority: 'low' as const,
    label: 'Freiwilligen-Zeiterfassung',
    desc: 'Optionale Stundenerfassung für Ehrenamtliche',
    impact: 'Verbessert Transparenz',
  },
] as const;
