/**
 * Application Status Configuration
 *
 * SSOT for application status values, labels, and colors.
 * Used in Kanban board, filters, and status badges.
 */

export const APPLICATION_STATUSES = [
  {
    id: 'prospect',
    label: 'Interessant',
    description: 'Potenzielle Stiftungen, die wir ansprechen wollen',
    color: 'bg-bg-light text-grey-dark border-border',
  },
  {
    id: 'research',
    label: 'In Recherche',
    description: 'Stiftungs-Fit und Anforderungen werden geprüft',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  {
    id: 'draft',
    label: 'Entwurf',
    description: 'Gesuch wird erarbeitet',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
  },
  {
    id: 'review',
    label: 'In Prüfung',
    description: 'Interne Prüfung vor der Einreichung',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  },
  {
    id: 'submitted',
    label: 'Eingereicht (extern)',
    description: 'Gesuch wurde an die Stiftung gesendet',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  },
  {
    id: 'pending',
    label: 'Entscheidung ausstehend',
    description: 'Wir warten auf die Entscheidung der Stiftung',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
  },
  {
    id: 'followup',
    label: 'Nachfassen',
    description: 'Nachfassen erforderlich',
    color: 'bg-pink-100 text-pink-700 border-pink-300',
  },
  {
    id: 'accepted',
    label: 'Zugesagt ✓',
    description: 'Förderung zugesagt',
    color: 'bg-green-100 text-green-700 border-green-300',
  },
  {
    id: 'rejected',
    label: 'Abgelehnt',
    description: 'Gesuch wurde abgelehnt',
    color: 'bg-red-100 text-red-700 border-red-300',
  },
  {
    id: 'withdrawn',
    label: 'Zurückgezogen',
    description: 'Gesuch von uns zurückgezogen',
    color: 'bg-bg-light text-text-light border-border',
  },
  {
    id: 'onhold',
    label: 'Pausiert',
    description: 'Gesuch pausiert — wird später weiterverfolgt',
    color: 'bg-slate-100 text-slate-600 border-slate-300',
  },
] as const;

export type ApplicationStatusId = typeof APPLICATION_STATUSES[number]['id'];

/**
 * Priority level colors — SSOT for P1-P4 badge styling
 */
export const PRIORITY_COLORS: Record<number, string> = {
  1: 'bg-red-100 text-red-700',
  2: 'bg-orange-100 text-orange-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-green-100 text-green-700',
};

export const PRIORITY_COLOR_DEFAULT = 'bg-bg-light text-text-muted';

export function getPriorityColor(level: number | null): string {
  if (level === null) return PRIORITY_COLOR_DEFAULT;
  return PRIORITY_COLORS[level] ?? PRIORITY_COLOR_DEFAULT;
}

/**
 * Get status configuration by ID
 */
export function getStatusConfig(statusId: ApplicationStatusId) {
  return APPLICATION_STATUSES.find(s => s.id === statusId);
}

/**
 * Get color classes for status badge
 */
export function getStatusColor(statusId: ApplicationStatusId): string {
  return getStatusConfig(statusId)?.color || 'bg-bg-light text-grey-dark';
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
  'accepted',
] as const;
