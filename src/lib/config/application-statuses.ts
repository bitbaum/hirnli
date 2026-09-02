/**
 * Application Status Configuration
 *
 * SSOT for application status values, labels, and colors.
 * Used in Kanban board, filters, and status badges.
 */

export interface RequiredField {
  field: string;
  label: string;
  type: 'date' | 'number' | 'text';
}

const NO_REQUIRED_FIELDS: RequiredField[] = [];

export const APPLICATION_STATUSES = [
  {
    id: 'prospect',
    label: 'Interessant',
    description: 'Potenzielle Stiftungen, die wir ansprechen wollen',
    color: 'bg-surface-raised text-text-primary border-border-default',
    chartColor: { bg: 'rgba(156, 163, 175, 0.6)', border: 'rgba(156, 163, 175, 1)' },
    requiredFields: NO_REQUIRED_FIELDS,
  },
  {
    id: 'research',
    label: 'In Recherche',
    description: 'Stiftungs-Fit und Anforderungen werden geprüft',
    color: 'bg-primary/10 text-primary-text border-primary/30',
    chartColor: { bg: 'rgba(59, 130, 246, 0.6)', border: 'rgba(59, 130, 246, 1)' },
    requiredFields: NO_REQUIRED_FIELDS,
  },
  {
    id: 'draft',
    label: 'Entwurf',
    description: 'Gesuch wird erarbeitet',
    color: 'bg-purple-bg text-purple-text border-purple/30',
    chartColor: { bg: 'rgba(147, 51, 234, 0.6)', border: 'rgba(147, 51, 234, 1)' },
    requiredFields: NO_REQUIRED_FIELDS,
  },
  {
    id: 'review',
    label: 'In Prüfung',
    description: 'Interne Prüfung vor der Einreichung',
    color: 'bg-yellow-bg text-yellow-text border-yellow/30',
    chartColor: { bg: 'rgba(234, 179, 8, 0.6)', border: 'rgba(234, 179, 8, 1)' },
    requiredFields: NO_REQUIRED_FIELDS,
  },
  {
    id: 'submitted',
    label: 'Eingereicht (extern)',
    description: 'Gesuch wurde an die Stiftung gesendet',
    color: 'bg-theme-digital/10 text-theme-digital border-theme-digital/30',
    chartColor: { bg: 'rgba(99, 102, 241, 0.6)', border: 'rgba(99, 102, 241, 1)' },
    requiredFields: [
      { field: 'submissionDate', label: 'Einreichungsdatum', type: 'date' },
    ] satisfies RequiredField[],
  },
  {
    id: 'pending',
    label: 'Entscheidung ausstehend',
    description: 'Wir warten auf die Entscheidung der Stiftung',
    color: 'bg-warning-bg text-warning-text border-warning/30',
    chartColor: { bg: 'rgba(249, 115, 22, 0.6)', border: 'rgba(249, 115, 22, 1)' },
    requiredFields: NO_REQUIRED_FIELDS,
  },
  {
    id: 'followup',
    label: 'Nachfassen',
    description: 'Nachfassen erforderlich',
    color: 'bg-pink-bg text-pink-text border-pink/30',
    chartColor: { bg: 'rgba(236, 72, 153, 0.6)', border: 'rgba(236, 72, 153, 1)' },
    requiredFields: NO_REQUIRED_FIELDS,
  },
  {
    id: 'accepted',
    label: 'Zugesagt ✓',
    description: 'Förderung zugesagt',
    color: 'bg-success-bg text-success-text border-success/30',
    chartColor: { bg: 'rgba(34, 197, 94, 0.6)', border: 'rgba(34, 197, 94, 1)' },
    requiredFields: [
      { field: 'awardedAmount', label: 'Bewilligter Betrag (CHF)', type: 'number' },
    ] satisfies RequiredField[],
  },
  {
    id: 'rejected',
    label: 'Abgelehnt',
    description: 'Gesuch wurde abgelehnt',
    color: 'bg-danger-bg text-danger-text border-danger/30',
    chartColor: { bg: 'rgba(239, 68, 68, 0.6)', border: 'rgba(239, 68, 68, 1)' },
    requiredFields: [
      { field: 'rejectionReason', label: 'Ablehnungsgrund', type: 'text' },
    ] satisfies RequiredField[],
  },
  {
    id: 'withdrawn',
    label: 'Zurückgezogen',
    description: 'Gesuch von uns zurückgezogen',
    color: 'bg-surface-raised text-text-secondary border-border-default',
    chartColor: { bg: 'rgba(203, 213, 225, 0.6)', border: 'rgba(203, 213, 225, 1)' },
    requiredFields: NO_REQUIRED_FIELDS,
  },
  {
    id: 'onhold',
    label: 'Pausiert',
    description: 'Gesuch pausiert — wird später weiterverfolgt',
    color: 'bg-surface-raised text-text-muted border-border-default',
    chartColor: { bg: 'rgba(100, 116, 139, 0.6)', border: 'rgba(100, 116, 139, 1)' },
    requiredFields: NO_REQUIRED_FIELDS,
  },
] as const;

export type ApplicationStatusId = (typeof APPLICATION_STATUSES)[number]['id'];

/** Tuple of all status IDs — for Zod enum and schema typing. Derived from config SSOT. */
export const STATUS_IDS = APPLICATION_STATUSES.map((s) => s.id) as [
  ApplicationStatusId,
  ...ApplicationStatusId[],
];

import { PRIORITY_CONFIG } from './foundations';

const PRIORITY_COLOR_DEFAULT = 'bg-surface-raised text-text-muted';

export function getPriorityColor(level: number | null): string {
  if (level === null) return PRIORITY_COLOR_DEFAULT;
  return PRIORITY_CONFIG[level]?.color ?? PRIORITY_COLOR_DEFAULT;
}

/**
 * Get status configuration by ID
 */
export function getStatusConfig(
  statusId: ApplicationStatusId,
): (typeof APPLICATION_STATUSES)[number] {
  return APPLICATION_STATUSES.find((s) => s.id === statusId)!;
}

/**
 * Kanban board columns (subset of all statuses)
 */
export const KANBAN_COLUMNS = [
  'prospect',
  'research',
  'draft',
  'review',
  'submitted',
  'pending',
  'followup',
  'accepted',
  'onhold',
] as const;

/** Final-decision statuses — show outcome fields (successFactors, rejectionReason) */
export function isTerminalStatus(status: ApplicationStatusId): boolean {
  return status === 'accepted' || status === 'rejected';
}

/** Active statuses — the application is still being pursued (not closed or withdrawn) */
export function isActiveApplication(status: ApplicationStatusId): boolean {
  return status !== 'rejected' && status !== 'withdrawn';
}
