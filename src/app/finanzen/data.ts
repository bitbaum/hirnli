// Revenue category config — SSOT for labels, codes, colors
export const REVENUE_CATEGORIES = [
  { key: 'warenverkauf' as const, label: 'Warenverkauf', code: '3100' },
  { key: 'dienstleistungen' as const, label: 'Dienstleistungen', code: '3400' },
  { key: 'integration' as const, label: 'Integration', code: '3450' },
  { key: 'spenden' as const, label: 'Spenden', code: '3500' },
  { key: 'aufstockung' as const, label: 'Aufstockung', code: '3510' },
] as const;
