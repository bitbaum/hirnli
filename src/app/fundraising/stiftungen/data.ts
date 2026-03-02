import { THEMES, TYPE_LABELS, STATUS_LABELS } from '@/lib/config/foundations';
import type { FoundationStatus, FoundationType, QualityTier } from '@/lib/schemas/foundation';
import type { SortField } from '@/lib/domain/foundation-filter';

// -- Research Pipeline Funnel (SSOT for the broader context) -------------------
// Sources: Fundraiso/Spheriq for Swiss universe, ESA import for registry,
// STIFTUNGEN_DATA.length for pipeline/generated counts (computed at runtime).

/** Approximate count of all Swiss foundations (Fundraiso/Spheriq/Zefix) */
export const SWISS_FOUNDATION_UNIVERSE = 14_000;

/** Approximate count in our registry table (ESA bulk import, org-agnostic) */
export const REGISTRY_COUNT = 5_400;

/** Label for funnel stages — shown in the pipeline visualization */
export const FUNNEL_STAGES: { key: string; label: string; description: string; color: string }[] = [
  {
    key: 'universe',
    label: 'Schweizer Stiftungen',
    description: 'Alle registrierten Stiftungen in CH (Fundraiso/Zefix)',
    color: 'bg-bg-light text-text-muted',
  },
  {
    key: 'registry',
    label: 'Im Register',
    description: 'ESA-Import mit Zweck, Kontakt und Rechtsform',
    color: 'bg-grey-light text-text-muted',
  },
  {
    key: 'pipeline',
    label: 'In Analyse-Pipeline',
    description: 'Für Revamp-IT vorselektiert und mit Daten angereichert',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    key: 'recherchiert',
    label: 'Recherchiert',
    description: 'Verifizierte Website, direkter Kontakt, Fit-Analyse',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    key: 'gesuchReady',
    label: 'Gesuch-bereit',
    description: 'Bewerbungsweg und Fördersumme bekannt — Gesuch generiert',
    color: 'bg-success-bg text-success',
  },
];

/** Tier descriptions for the methodology tooltip */
export const TIER_METHODOLOGY: { tier: QualityTier; signals: string[] }[] = [
  { tier: 'anwendungsbereit', signals: ['Eigene Website', 'Direktkontakt (E-Mail/Telefon)', 'Bewerbungs-URL', 'Förderbetrag'] },
  { tier: 'recherchiert', signals: ['Eigene Website', 'Direktkontakt (E-Mail/Telefon)'] },
  { tier: 'profiliert', signals: ['Themen zugeordnet', 'Kontaktdaten vorhanden'] },
  { tier: 'erfasst', signals: ['Stiftungszweck oder Themen oder Fit-Score'] },
  { tier: 'verzeichnet', signals: ['Name und UID im Schweizer Register'] },
];

export const THEME_CHIPS = Object.values(THEMES).map((t) => ({
  id: t.id,
  label: t.label,
  icon: t.icon,
  color: t.color,
}));

export const STATUS_CHIPS = (
  Object.entries(STATUS_LABELS) as [FoundationStatus, { text: string }][]
).map(([id, label]) => ({
  id,
  label: label.text,
}));

export const TYPE_CHIPS = (
  Object.entries(TYPE_LABELS) as [FoundationType, { short: string; long: string }][]
).map(([id, label]) => ({
  id,
  label: `${label.short}: ${label.long}`,
}));

export const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'priority', label: 'Priorität' },
  { value: 'fit', label: 'Fit (beste zuerst)' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'deadline', label: 'Deadline (nächste zuerst)' },
];

export const FIT_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'Alle' },
  { value: 2, label: '2+ Sterne' },
  { value: 3, label: '3 Sterne' },
];

export const PRIORITY_COLORS: Record<number, string> = {
  1: 'bg-red-100 text-red-700',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-blue-100 text-blue-700',
  4: 'bg-bg-light text-text-muted',
};
