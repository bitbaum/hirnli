import { TYPE_LABELS, STATUS_LABELS } from '@/lib/config/foundations';
import type { FoundationStatus, FoundationType } from '@/lib/schemas/foundation';
import type { SortField } from '@/lib/domain/foundation-filter';

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
  { value: 'fit', label: 'Fit-Score (beste zuerst)' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'deadline', label: 'Deadline (nächste zuerst)' },
];
