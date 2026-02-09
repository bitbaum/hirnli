import { THEMES, TYPE_LABELS, STATUS_LABELS } from '@/lib/config/foundations';
import type { ThemeId, FoundationStatus, FoundationType } from '@/lib/schemas/foundation';
import type { SortField } from '@/lib/domain/foundation-filter';

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
  4: 'bg-gray-100 text-gray-500',
};
