/* ────────────────────────────────────────────
   Static data for the strategie page

   ORG-SPECIFIC: Content written for Revamp-IT.
   To support a new org, rewrite this file's content.
   ONE ORGANISATION'S CONTENT. Gated by `ownsCodeContent('strategie')`; moves
   to `org_content` with the rest of the per-tenant prose.
   ──────────────────────────────────────────── */

import { HUB_SPACE_DISPLAY, PEOPLE_REACHED_PER_YEAR } from '@/lib/config/projections';

export const VISION_TARGETS = [
  {
    value: HUB_SPACE_DISPLAY,
    label: 'Community Tech Hub in Zürich Agglomeration',
    source: {
      methodology:
        'Detaillierter Raumplan (fundraising/data.ts SPACE_PLAN) + Mietkalkulation budget-scenarios.ts',
      confidence: 'medium',
      lastVerified: '2026-02-16',
      notes:
        'Mietkosten: ~600m² × CHF 200/m²/Jahr = CHF 120k/Jahr (Agglomeration). Quelle: budget-scenarios.ts',
    },
  },
  {
    value: 'Schweizweit',
    label: 'Netzwerk von Repair-Hubs aufbauen',
    source: {
      methodology:
        'Vision für föderales Modell: Zürich als Flagship-Hub, Franchise-/Partner-Modell für weitere Städte',
      confidence: 'aspirational',
      lastVerified: '2026-01-15',
      notes: 'Erfordert: Standardisierte SOPs, Train-the-Trainer Programme, zentrale Logistik',
    },
  },
  {
    value: PEOPLE_REACHED_PER_YEAR,
    label: 'Menschen pro Jahr direkt trainiert (Jahr 3)',
    source: {
      methodology: 'Konservative Schätzung: 2× BPL direkte Trainings + Workshop-Teilnehmer',
      confidence: 'estimated',
      lastVerified: '2026-02-16',
      notes: 'Hardware-BPL 8-12 + Software-BPL 6-10 + Workshops 20-40 = 40-60 Menschen/Jahr',
    },
  },
  {
    value: '100%',
    label: 'Aller Einnahmen fliessen zurück in die Mission',
    source: {
      methodology:
        'Gemeinnütziger Verein (non-profit): Per Statuten keine Gewinnausschüttung, alle Einnahmen reinvestiert in Mission',
      confidence: 'high',
      lastVerified: '2026-01-15',
      notes: `Bereits heute 100% — Dies ist keine Zukunftsvision, sondern unser Grundprinzip seit 2003`,
    },
  },
] as const;

export type SdgRow = { sdg: string; name: string; activities: string };

export const SDG_DATA = [
  {
    sdg: 'SDG 4',
    name: 'Hochwertige Bildung',
    activities: 'Workshops, Digital-Skills-Training, Praktikanten-Ausbildung',
  },
  {
    sdg: 'SDG 8',
    name: 'Menschenwürdige Arbeit',
    activities: 'Arbeitsintegrationsprogramme, sinnvolle Beschäftigung',
  },
  {
    sdg: 'SDG 9',
    name: 'Innovation & Infrastruktur',
    activities: 'Zugang zu IT-Infrastruktur, Open-Source-Lösungen',
  },
  {
    sdg: 'SDG 10',
    name: 'Weniger Ungleichheiten',
    activities: 'Solidarisches Preismodell, Gratis-Geräte für Bedürftige',
  },
  {
    sdg: 'SDG 12',
    name: 'Nachhaltiger Konsum',
    activities: 'Refurbishment, Reparatur statt Neukauf',
  },
  {
    sdg: 'SDG 13',
    name: 'Klimaschutz',
    activities: 'CO2-Vermeidung durch Lebensdauerverlängerung',
  },
] as const satisfies SdgRow[];

type SdgLabel = (typeof SDG_DATA)[number]['sdg'];

export const SDG_COLORS: Record<SdgLabel, string> = {
  'SDG 4': 'gradient-sdg-4',
  'SDG 8': 'gradient-sdg-8',
  'SDG 9': 'gradient-sdg-9',
  'SDG 10': 'gradient-sdg-10',
  'SDG 12': 'gradient-sdg-12',
  'SDG 13': 'gradient-sdg-13',
};
