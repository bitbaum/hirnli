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

export const APPLICATION_STATUSES = [
  {
    id: 'prospect',
    label: 'Interessant',
    description: 'Potenzielle Stiftungen, die wir ansprechen wollen',
    color: 'bg-bg-light text-grey-dark border-border',
    chartColor: { bg: 'rgba(156, 163, 175, 0.6)', border: 'rgba(156, 163, 175, 1)' },
    requiredFields: [] as RequiredField[],
  },
  {
    id: 'research',
    label: 'In Recherche',
    description: 'Stiftungs-Fit und Anforderungen werden geprüft',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    chartColor: { bg: 'rgba(59, 130, 246, 0.6)', border: 'rgba(59, 130, 246, 1)' },
    requiredFields: [] as RequiredField[],
  },
  {
    id: 'draft',
    label: 'Entwurf',
    description: 'Gesuch wird erarbeitet',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    chartColor: { bg: 'rgba(147, 51, 234, 0.6)', border: 'rgba(147, 51, 234, 1)' },
    requiredFields: [] as RequiredField[],
  },
  {
    id: 'review',
    label: 'In Prüfung',
    description: 'Interne Prüfung vor der Einreichung',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    chartColor: { bg: 'rgba(234, 179, 8, 0.6)', border: 'rgba(234, 179, 8, 1)' },
    requiredFields: [] as RequiredField[],
  },
  {
    id: 'submitted',
    label: 'Eingereicht (extern)',
    description: 'Gesuch wurde an die Stiftung gesendet',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    chartColor: { bg: 'rgba(99, 102, 241, 0.6)', border: 'rgba(99, 102, 241, 1)' },
    requiredFields: [
      { field: 'submissionDate', label: 'Einreichungsdatum', type: 'date' },
    ] as RequiredField[],
  },
  {
    id: 'pending',
    label: 'Entscheidung ausstehend',
    description: 'Wir warten auf die Entscheidung der Stiftung',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    chartColor: { bg: 'rgba(249, 115, 22, 0.6)', border: 'rgba(249, 115, 22, 1)' },
    requiredFields: [] as RequiredField[],
  },
  {
    id: 'followup',
    label: 'Nachfassen',
    description: 'Nachfassen erforderlich',
    color: 'bg-pink-100 text-pink-700 border-pink-300',
    chartColor: { bg: 'rgba(236, 72, 153, 0.6)', border: 'rgba(236, 72, 153, 1)' },
    requiredFields: [] as RequiredField[],
  },
  {
    id: 'accepted',
    label: 'Zugesagt ✓',
    description: 'Förderung zugesagt',
    color: 'bg-green-100 text-green-700 border-green-300',
    chartColor: { bg: 'rgba(34, 197, 94, 0.6)', border: 'rgba(34, 197, 94, 1)' },
    requiredFields: [
      { field: 'awardedAmount', label: 'Bewilligter Betrag (CHF)', type: 'number' },
    ] as RequiredField[],
  },
  {
    id: 'rejected',
    label: 'Abgelehnt',
    description: 'Gesuch wurde abgelehnt',
    color: 'bg-red-100 text-red-700 border-red-300',
    chartColor: { bg: 'rgba(239, 68, 68, 0.6)', border: 'rgba(239, 68, 68, 1)' },
    requiredFields: [
      { field: 'rejectionReason', label: 'Ablehnungsgrund', type: 'text' },
    ] as RequiredField[],
  },
  {
    id: 'withdrawn',
    label: 'Zurückgezogen',
    description: 'Gesuch von uns zurückgezogen',
    color: 'bg-bg-light text-text-light border-border',
    chartColor: { bg: 'rgba(203, 213, 225, 0.6)', border: 'rgba(203, 213, 225, 1)' },
    requiredFields: [] as RequiredField[],
  },
  {
    id: 'onhold',
    label: 'Pausiert',
    description: 'Gesuch pausiert — wird später weiterverfolgt',
    color: 'bg-slate-100 text-slate-600 border-slate-300',
    chartColor: { bg: 'rgba(100, 116, 139, 0.6)', border: 'rgba(100, 116, 139, 1)' },
    requiredFields: [] as RequiredField[],
  },
] as const;

export type ApplicationStatusId = typeof APPLICATION_STATUSES[number]['id'];

/** Tuple of all status IDs — for Zod enum and schema typing. Derived from config SSOT. */
export const STATUS_IDS = APPLICATION_STATUSES.map(s => s.id) as [ApplicationStatusId, ...ApplicationStatusId[]];

import { PRIORITY_CONFIG } from './foundations';

const PRIORITY_COLOR_DEFAULT = 'bg-bg-light text-text-muted';

export function getPriorityColor(level: number | null): string {
  if (level === null) return PRIORITY_COLOR_DEFAULT;
  return PRIORITY_CONFIG[level]?.color ?? PRIORITY_COLOR_DEFAULT;
}

/**
 * Get status configuration by ID
 */
export function getStatusConfig(statusId: ApplicationStatusId): typeof APPLICATION_STATUSES[number] {
  return APPLICATION_STATUSES.find(s => s.id === statusId)!;
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
