/**
 * Application Status Configuration
 *
 * SSOT for application status values, labels, and colors.
 * Used in Kanban board, filters, and status badges.
 */

export const APPLICATION_STATUSES = [
  {
    id: 'prospect',
    label: 'Prospects',
    description: 'Potential foundations to approach',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
  },
  {
    id: 'research',
    label: 'Recherche',
    description: 'Researching foundation fit and requirements',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  {
    id: 'draft',
    label: 'Entwurf',
    description: 'Drafting application materials',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
  },
  {
    id: 'review',
    label: 'Prüfung',
    description: 'Internal review before submission',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  },
  {
    id: 'submitted',
    label: 'Eingereicht',
    description: 'Application submitted to foundation',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  },
  {
    id: 'pending',
    label: 'Ausstehend',
    description: 'Awaiting decision from foundation',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
  },
  {
    id: 'followup',
    label: 'Nachfassen',
    description: 'Follow-up needed',
    color: 'bg-pink-100 text-pink-700 border-pink-300',
  },
  {
    id: 'accepted',
    label: 'Angenommen',
    description: 'Application accepted - funding secured',
    color: 'bg-green-100 text-green-700 border-green-300',
  },
  {
    id: 'rejected',
    label: 'Abgelehnt',
    description: 'Application rejected',
    color: 'bg-red-100 text-red-700 border-red-300',
  },
  {
    id: 'withdrawn',
    label: 'Zurückgezogen',
    description: 'Application withdrawn by us',
    color: 'bg-gray-100 text-gray-600 border-gray-300',
  },
  {
    id: 'onhold',
    label: 'Pausiert',
    description: 'Application on hold',
    color: 'bg-slate-100 text-slate-600 border-slate-300',
  },
] as const;

export type ApplicationStatusId = typeof APPLICATION_STATUSES[number]['id'];

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
  return getStatusConfig(statusId)?.color || 'bg-gray-100 text-gray-700';
}

/**
 * Kanban board columns (subset of all statuses)
 */
export const KANBAN_COLUMNS = [
  'prospect',
  'draft',
  'submitted',
  'pending',
  'accepted',
] as const;
